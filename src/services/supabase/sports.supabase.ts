import type { Bet, BetSelection, BetStatus, Paginated, Result, Sport, SportEventDetail, SportsService } from "../types";
import { fail, ok } from "../types";
import { createOddsDrift, findEvent, listEvents, listSports } from "../shared/sports";
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
   * There is no results feed, so open bets are ticked over on demand. The
   * decision is made entirely in SQL: settle_due_bets takes no arguments, works
   * only on the caller's own due bets, and derives each outcome from the bet id.
   * The client cannot say whether a bet won — settle_bet itself is staff-only.
   */
  const settleDueBets = async (): Promise<void> => {
    await supabase.rpc("settle_due_bets");
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

      await settleDueBets();

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
