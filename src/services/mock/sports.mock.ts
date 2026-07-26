import type {
  Bet,
  Market,
  OddsUpdate,
  Outcome,
  Paginated,
  Result,
  Sport,
  SportEvent,
  SportEventDetail,
  SportsService,
} from "../types";
import { fail, ok } from "../types";
import { EVENTS, type EventFixture } from "./fixtures/events";
import { RATES } from "./fixtures/coins";
import { currentUserId } from "./auth.mock";
import { dbKeys, dbRead, dbWrite, makeId } from "./db";
import { delay, Emitter } from "./latency";
import { addTransaction, credit } from "./walletCore";
import { pushSystemNotification } from "./notifications.mock";
import { addWagerProgress } from "./bonus.mock";
import { hashString, rngFloat, seededRng } from "@/lib/rng";
import { SPORT_SLUGS } from "@/lib/constants";

/** Demo time is accelerated: open bets settle this long after placement. */
const SETTLE_AFTER_MS = 120_000;

/** Extra market templates layered on top of the main 1X2/moneyline market. */
const MARKET_TEMPLATES: { key: string; outcomes: string[] }[] = [
  { key: "totalGoals", outcomes: ["over", "under"] },
  { key: "bothScore", outcomes: ["yes", "no"] },
  { key: "doubleChance", outcomes: ["homeOrDraw", "homeOrAway", "drawOrAway"] },
  { key: "handicap", outcomes: ["homeHandicap", "awayHandicap"] },
  { key: "firstHalf", outcomes: ["home", "draw", "away"] },
  { key: "correctScore", outcomes: ["score10", "score21", "score11", "score02"] },
];

/** Odds are derived from ids, so every render and reload agrees. */
function buildOdds(seed: string, count: number, hasDraw: boolean): number[] {
  const rng = seededRng(seed);
  if (count === 3) {
    const home = rngFloat(rng, 1.45, 3.9);
    const draw = rngFloat(rng, 2.9, 4.6);
    const away = rngFloat(rng, 1.5, 4.6);
    return [home, draw, away];
  }
  if (count === 2 && hasDraw) return [rngFloat(rng, 1.4, 3.2), rngFloat(rng, 1.4, 3.2)];
  return Array.from({ length: count }, () => rngFloat(rng, 1.35, 5.5));
}

function mainMarket(fx: EventFixture): Market {
  const labels = fx.hasDraw ? [fx.home, "draw", fx.away] : [fx.home, fx.away];
  const odds = buildOdds(`${fx.id}:main`, labels.length, fx.hasDraw);
  return {
    id: `${fx.id}-main`,
    key: fx.hasDraw ? "matchResult" : "moneyline",
    outcomes: labels.map((label, i) => ({
      id: `${fx.id}-main-${i}`,
      label,
      odds: odds[i],
    })),
  };
}

function allMarkets(fx: EventFixture): Market[] {
  const extras = MARKET_TEMPLATES.filter((t) => fx.hasDraw || !["doubleChance"].includes(t.key)).map(
    (template, ti) => {
      const odds = buildOdds(`${fx.id}:${template.key}`, template.outcomes.length, false);
      return {
        id: `${fx.id}-m${ti}`,
        key: template.key,
        outcomes: template.outcomes.map((label, i) => ({
          id: `${fx.id}-m${ti}-${i}`,
          label,
          odds: odds[i],
        })),
      } satisfies Market;
    },
  );
  return [mainMarket(fx), ...extras];
}

/** Fixture times are relative, so they are materialised on every call. */
function toEvent(fx: EventFixture): SportEvent {
  return {
    id: fx.id,
    sport: fx.sport,
    league: fx.league,
    home: fx.home,
    away: fx.away,
    startsAt: new Date(Date.now() + fx.startsInMin * 60_000).toISOString(),
    isLive: fx.isLive,
    score: fx.score,
    minute: fx.isLive ? Math.abs(fx.startsInMin) : undefined,
    mainMarket: mainMarket(fx),
    marketCount: fx.marketCount,
  };
}

export function createSportsService(): SportsService {
  const oddsEmitter = new Emitter<OddsUpdate[]>();
  let driftTimer: ReturnType<typeof setInterval> | null = null;
  let watchedIds: string[] = [];
  let tick = 0;

  const readBets = (uid: string) => dbRead<Bet[]>(dbKeys.bets(uid), []);
  const writeBets = (uid: string, bets: Bet[]) => dbWrite(dbKeys.bets(uid), bets);

  /** Settles due open bets: credits wins, records the transaction, notifies. */
  const settleDueBets = (uid: string) => {
    const bets = readBets(uid);
    const now = Date.now();
    let changed = false;

    const updated = bets.map((bet) => {
      if (bet.status !== "open") return bet;
      if (now - new Date(bet.createdAt).getTime() < SETTLE_AFTER_MS) return bet;

      // Deterministic outcome, slightly player-favoured for a lively demo
      const won = hashString(bet.id) % 100 < 48;
      changed = true;
      const settled: Bet = {
        ...bet,
        status: won ? "won" : "lost",
        settledAt: new Date().toISOString(),
      };

      if (won) {
        credit(uid, bet.coin, bet.potentialWin);
        addTransaction(uid, {
          id: makeId("tx"),
          type: "win",
          coin: bet.coin,
          amount: bet.potentialWin,
          status: "confirmed",
          createdAt: new Date().toISOString(),
          note: bet.selections[0]?.eventLabel,
        });
        pushSystemNotification({
          key: "betWon",
          values: { amount: Math.round(bet.potentialWin * 1e6) / 1e6, coin: bet.coin },
          href: "/profile/bets",
        });
      } else {
        pushSystemNotification({
          key: "betLost",
          values: { event: bet.selections[0]?.eventLabel ?? "" },
          href: "/profile/bets",
        });
      }
      return settled;
    });

    if (changed) writeBets(uid, updated);
  };

  const startDrift = () => {
    if (driftTimer) return;
    driftTimer = setInterval(() => {
      tick++;
      const updates: OddsUpdate[] = [];
      for (const id of watchedIds) {
        const fx = EVENTS.find((e) => e.id === id);
        if (!fx) continue;
        const rng = seededRng(`${id}:drift:${tick}`);
        // Only a slice of markets moves on each tick, as a real feed would
        if (rng() > 0.35) continue;
        const market = mainMarket(fx);
        const outcome = market.outcomes[Math.floor(rng() * market.outcomes.length)];
        const shift = rngFloat(rng, -0.12, 0.12);
        const next = Math.max(1.05, Math.round((outcome.odds + shift) * 100) / 100);
        updates.push({
          eventId: id,
          outcomeId: outcome.id,
          odds: next,
          direction: next >= outcome.odds ? "up" : "down",
        });
      }
      if (updates.length) oddsEmitter.emit(updates);
    }, 6000);
  };

  const stopDrift = () => {
    if (!driftTimer) return;
    clearInterval(driftTimer);
    driftTimer = null;
  };

  return {
    async getSports(): Promise<Sport[]> {
      await delay(120, 300);
      return SPORT_SLUGS.map((slug) => ({
        slug,
        liveCount: EVENTS.filter((e) => e.sport === slug && e.isLive).length,
        upcomingCount: EVENTS.filter((e) => e.sport === slug && !e.isLive).length,
      })).filter((s) => s.liveCount + s.upcomingCount > 0);
    },

    async getEvents(query = {}) {
      await delay(180, 420);
      let items = EVENTS;
      if (query.sport) items = items.filter((e) => e.sport === query.sport);
      if (query.live !== undefined) items = items.filter((e) => e.isLive === query.live);
      if (query.top) items = items.filter((e) => e.top);

      const events = items.map(toEvent).sort((a, b) => {
        if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
        return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
      });
      return query.limit ? events.slice(0, query.limit) : events;
    },

    async getEventById(id): Promise<SportEventDetail | null> {
      await delay(150, 350);
      const fx = EVENTS.find((e) => e.id === id);
      if (!fx) return null;
      return { ...toEvent(fx), markets: allMarkets(fx) };
    },

    async placeBet({ selections, stake, coin, type }): Promise<Result<Bet>> {
      await delay(400, 800);
      const uid = currentUserId();
      if (!uid) return fail("auth/not-authenticated");
      if (selections.length === 0) return fail("bets/empty-slip");
      if (!Number.isFinite(stake) || stake <= 0) return fail("bets/invalid-stake");

      const totalOdds =
        type === "combo"
          ? selections.reduce((acc, s) => acc * s.odds, 1)
          : selections[0]?.odds ?? 1;

      const bet: Bet = {
        id: makeId("bet"),
        type,
        selections,
        stake,
        coin,
        totalOdds: Math.round(totalOdds * 100) / 100,
        potentialWin: Math.round(stake * totalOdds * 1e6) / 1e6,
        status: "open",
        createdAt: new Date().toISOString(),
      };

      writeBets(uid, [bet, ...readBets(uid)]);
      // VIP XP and race volume accrue from wager size in USD terms
      addWagerProgress(stake * (RATES[coin] ?? 1));
      return ok(bet);
    },

    async getMyBets(filter = {}): Promise<Paginated<Bet>> {
      await delay(180, 400);
      const uid = currentUserId();
      if (uid) settleDueBets(uid);
      const all = uid ? readBets(uid) : [];
      const filtered =
        filter.status === "open"
          ? all.filter((b) => b.status === "open")
          : filter.status === "settled"
            ? all.filter((b) => b.status !== "open")
            : all;
      const page = filter.page ?? 1;
      const pageSize = filter.pageSize ?? 20;
      return {
        items: filtered.slice((page - 1) * pageSize, page * pageSize),
        total: filtered.length,
        page,
        pageSize,
      };
    },

    subscribeOdds(eventIds, cb) {
      watchedIds = [...new Set([...watchedIds, ...eventIds])];
      startDrift();
      const unsubscribe = oddsEmitter.subscribe((updates) => {
        const relevant = updates.filter((u) => eventIds.includes(u.eventId));
        if (relevant.length) cb(relevant);
      });
      return () => {
        unsubscribe();
        watchedIds = watchedIds.filter((id) => !eventIds.includes(id));
        if (watchedIds.length === 0) stopDrift();
      };
    },
  };
}

export type { Outcome };
