/**
 * Sportsbook catalogue and the simulated odds feed. Events, markets and odds are
 * fixture-derived in every backend — there is no live feed in this build — so
 * the mock and the Supabase implementation share the whole of this module and
 * differ only in where bets are stored.
 */

import type { Market, OddsUpdate, Sport, SportEvent, SportEventDetail, Unsubscribe } from "../types";
import { EVENTS, type EventFixture } from "../mock/fixtures/events";
import { Emitter } from "../mock/latency";
import { hashString, rngFloat, seededRng } from "@/lib/rng";
import { SPORT_SLUGS } from "@/lib/constants";

/** Demo time is accelerated: open bets settle this long after placement. */
export const SETTLE_AFTER_MS = 120_000;

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

export function mainMarket(fx: EventFixture): Market {
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
export function toEvent(fx: EventFixture): SportEvent {
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

export function listSports(): Sport[] {
  return SPORT_SLUGS.map((slug) => ({
    slug,
    liveCount: EVENTS.filter((e) => e.sport === slug && e.isLive).length,
    upcomingCount: EVENTS.filter((e) => e.sport === slug && !e.isLive).length,
  })).filter((s) => s.liveCount + s.upcomingCount > 0);
}

export interface EventQuery {
  sport?: string;
  live?: boolean;
  top?: boolean;
  limit?: number;
}

export function listEvents(query: EventQuery = {}): SportEvent[] {
  let items = EVENTS;
  if (query.sport) items = items.filter((e) => e.sport === query.sport);
  if (query.live !== undefined) items = items.filter((e) => e.isLive === query.live);
  if (query.top) items = items.filter((e) => e.top);

  const events = items.map(toEvent).sort((a, b) => {
    if (a.isLive !== b.isLive) return a.isLive ? -1 : 1;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });
  return query.limit ? events.slice(0, query.limit) : events;
}

export function findEvent(id: string): SportEventDetail | null {
  const fx = EVENTS.find((e) => e.id === id);
  if (!fx) return null;
  return { ...toEvent(fx), markets: allMarkets(fx) };
}

/** Deterministic outcome, slightly player-favoured for a lively demo. */
export function betWins(betId: string): boolean {
  return hashString(betId) % 100 < 48;
}

export function isDueForSettlement(createdAt: string, now = Date.now()): boolean {
  return now - new Date(createdAt).getTime() >= SETTLE_AFTER_MS;
}

/**
 * Seeded odds drift standing in for a bookmaker feed. Only a slice of markets
 * moves per tick, and the shift is derived from the event id plus the tick
 * counter so replays of the same session produce the same numbers.
 */
export function createOddsDrift() {
  const emitter = new Emitter<OddsUpdate[]>();
  let timer: ReturnType<typeof setInterval> | null = null;
  let watchedIds: string[] = [];
  let tick = 0;

  const start = () => {
    if (timer) return;
    timer = setInterval(() => {
      tick++;
      const updates: OddsUpdate[] = [];
      for (const id of watchedIds) {
        const fx = EVENTS.find((e) => e.id === id);
        if (!fx) continue;
        const rng = seededRng(`${id}:drift:${tick}`);
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
      if (updates.length) emitter.emit(updates);
    }, 6000);
  };

  const stop = () => {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
  };

  return {
    subscribe(eventIds: string[], cb: (updates: OddsUpdate[]) => void): Unsubscribe {
      watchedIds = [...new Set([...watchedIds, ...eventIds])];
      start();
      const unsubscribe = emitter.subscribe((updates) => {
        const relevant = updates.filter((u) => eventIds.includes(u.eventId));
        if (relevant.length) cb(relevant);
      });
      return () => {
        unsubscribe();
        watchedIds = watchedIds.filter((id) => !eventIds.includes(id));
        if (watchedIds.length === 0) stop();
      };
    },
  };
}
