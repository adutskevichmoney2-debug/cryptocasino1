import type { Bet, BetSelection, BetStatus, Paginated, Result, Sport, SportEventDetail, SportsService } from "../types";
import { fail, ok } from "../types";
import {
  betWins,
  createOddsDrift,
  findEvent,
  isDueForSettlement,
  listEvents,
  listSports,
  SETTLE_AFTER_MS,
} from "../shared/sports";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { BetRow, DbBetStatus } from "@/lib/supabase/types";
import { currentUserId } from "./auth.supabase";
import { errorCode, failFrom } from "./errors";

/** No cash-out UI in this build; a cashed-out bet still reads as a win. */
const BET_STATUS_FROM_DB: Record<DbBetStatus, BetStatus> = {
  open: "open",
  won: "won",
  lost: "lost",
  void: "void",
  cashed_out: "won",
};

/** Never settle more than this many bets in one getMyBets call. */
const SETTLE_BATCH = 20;

function toSelections(value: unknown): BetSelection[] {
  return Array.isArray(value) ? (value as BetSelection[]) : [];
}

function toBet(row: BetRow): Bet {
  return {
    id: row.id,
    type: row.bet_type,
    selections: toSelections(row.selections),
    stake: Number(row.stake),
    coin: row.coin,
    totalOdds: Number(row.total_odds),
    potentialWin: Number(row.potential_win),
    status: BET_STATUS_FROM_DB[row.status],
    createdAt: row.created_at,
    settledAt: row.settled_at ?? undefined,
  };
}

export function createSportsService(): SportsService {
  const supabase = getSupabaseBrowserClient();
  const drift = createOddsDrift();

  /**
   * There is no results feed, so the client ticks its own open bets over once
   * they are old enough. settle_bet credits the win, writes the ledger row and
   * pushes the notification; the outcome is derived from the bet id so a replay
   * always agrees with the mock backend.
   */
  const settleDueBets = async (uid: string): Promise<void> => {
    const cutoff = new Date(Date.now() - SETTLE_AFTER_MS).toISOString();
    const { data } = await supabase
      .from("bets")
      .select("id, created_at")
      .eq("user_id", uid)
      .eq("status", "open")
      .lte("created_at", cutoff)
      .limit(SETTLE_BATCH);

    for (const row of data ?? []) {
      if (!isDueForSettlement(row.created_at)) continue;
      await supabase.rpc("settle_bet", { p_bet_id: row.id, p_won: betWins(row.id) });
    }
  };

  return {
    // Events, markets and odds stay in fixtures — see ../shared/sports.
    async getSports(): Promise<Sport[]> {
      return listSports();
    },

    async getEvents(query = {}) {
      return listEvents(query);
    },

    async getEventById(id): Promise<SportEventDetail | null> {
      return findEvent(id);
    },

    async placeBet({ selections, stake, coin, type }): Promise<Result<Bet>> {
      if (selections.length === 0) return fail("bets/empty-slip");
      if (!Number.isFinite(stake) || stake <= 0) return fail("bets/invalid-stake");

      try {
        // place_bet recomputes the odds server-side, debits the stake and adds
        // the XP — a tampered payload cannot inflate the payout.
        const { data, error } = await supabase.rpc("place_bet", {
          p_selections: selections,
          p_stake: stake,
          p_coin: coin,
          p_type: type,
        });
        if (error || !data) return fail(errorCode(error));
        return ok(toBet(data));
      } catch (error) {
        return failFrom(error);
      }
    },

    async getMyBets(filter = {}): Promise<Paginated<Bet>> {
      const page = filter.page ?? 1;
      const pageSize = filter.pageSize ?? 20;
      const uid = await currentUserId();
      if (!uid) return { items: [], total: 0, page, pageSize };

      await settleDueBets(uid);

      let query = supabase
        .from("bets")
        .select("*", { count: "exact" })
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (filter.status === "open") query = query.eq("status", "open");
      if (filter.status === "settled") query = query.neq("status", "open");

      const { data, count } = await query.range((page - 1) * pageSize, page * pageSize - 1);
      return {
        items: (data ?? []).map(toBet),
        total: count ?? 0,
        page,
        pageSize,
      };
    },

    subscribeOdds(eventIds, cb) {
      return drift.subscribe(eventIds, cb);
    },
  };
}
