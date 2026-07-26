import type { Bet, Outcome, Paginated, Result, Sport, SportEventDetail, SportsService } from "../types";
import { fail, ok } from "../types";
import {
  betWins,
  createOddsDrift,
  findEvent,
  isDueForSettlement,
  listEvents,
  listSports,
} from "../shared/sports";
import { RATES } from "./fixtures/coins";
import { currentUserId } from "./auth.mock";
import { dbKeys, dbRead, dbWrite, makeId } from "./db";
import { delay } from "./latency";
import { addTransaction, credit } from "./walletCore";
import { pushSystemNotification } from "./notifications.mock";
import { addWagerProgress } from "./bonus.mock";

export function createSportsService(): SportsService {
  const drift = createOddsDrift();

  const readBets = (uid: string) => dbRead<Bet[]>(dbKeys.bets(uid), []);
  const writeBets = (uid: string, bets: Bet[]) => dbWrite(dbKeys.bets(uid), bets);

  /** Settles due open bets: credits wins, records the transaction, notifies. */
  const settleDueBets = (uid: string) => {
    const bets = readBets(uid);
    let changed = false;

    const updated = bets.map((bet) => {
      if (bet.status !== "open") return bet;
      if (!isDueForSettlement(bet.createdAt)) return bet;

      const won = betWins(bet.id);
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

  return {
    async getSports(): Promise<Sport[]> {
      await delay(120, 300);
      return listSports();
    },

    async getEvents(query = {}) {
      await delay(180, 420);
      return listEvents(query);
    },

    async getEventById(id): Promise<SportEventDetail | null> {
      await delay(150, 350);
      return findEvent(id);
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
      return drift.subscribe(eventIds, cb);
    },
  };
}

export type { Outcome };
