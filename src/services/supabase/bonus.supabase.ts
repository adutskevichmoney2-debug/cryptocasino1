import type {
  BonusService,
  LeaderboardEntry,
  ReferralInfo,
  Result,
  UserBonus,
  VipLevel,
  VipStatus,
} from "../types";
import { fail, ok } from "../types";
import { PROMOTIONS, VIP_LEVELS } from "../mock/fixtures/promotions";
import { RACE_PRIZE_POOL, RACE_SIZE, vipStatusFor } from "../shared/bonus";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserBonusRow } from "@/lib/supabase/types";
import { currentUserId } from "./auth.supabase";
import { errorCode, failFrom } from "./errors";

const REFERRAL_BASE = "https://cryptocasino.demo";

function toUserBonus(row: UserBonusRow): UserBonus {
  return {
    id: row.id,
    code: row.code,
    key: row.label_key,
    amount: Number(row.amount),
    coin: row.coin,
    wagerRequired: Number(row.wager_required),
    wagerDone: Number(row.wager_done),
    claimedAt: row.claimed_at,
    expiresAt: row.expires_at,
  };
}

export function createBonusService(): BonusService {
  const supabase = getSupabaseBrowserClient();

  return {
    // Promotions and the VIP ladder are editorial fixtures, not user data.
    async getPromotions() {
      return PROMOTIONS;
    },

    async getPromotionBySlug(slug) {
      return PROMOTIONS.find((p) => p.slug === slug) ?? null;
    },

    async getVipLevels(): Promise<VipLevel[]> {
      return VIP_LEVELS;
    },

    async getActiveBonuses() {
      const uid = await currentUserId();
      if (!uid) return [];
      const { data } = await supabase
        .from("user_bonuses")
        .select("*")
        .eq("user_id", uid)
        .gt("expires_at", new Date().toISOString())
        .order("claimed_at", { ascending: false });
      return (data ?? []).map(toUserBonus);
    },

    async claimPromoCode(code): Promise<Result<UserBonus>> {
      try {
        // The RPC validates the code, credits the bonus and writes the ledger
        // row in one transaction.
        const { data, error } = await supabase.rpc("claim_promo_code", {
          p_code: code.trim().toUpperCase(),
        });
        if (error || !data) return fail(errorCode(error));
        return ok(toUserBonus(data));
      } catch (error) {
        return failFrom(error);
      }
    },

    async getVipStatus(): Promise<VipStatus> {
      const uid = await currentUserId();
      if (!uid) return vipStatusFor(0);
      const { data } = await supabase.from("profiles").select("xp").eq("id", uid).maybeSingle();
      return vipStatusFor(Number(data?.xp ?? 0));
    },

    /**
     * Ranked in SQL. `leaderboard` is SECURITY DEFINER because RLS scopes bets
     * and profiles to their owner — aggregating in the browser ranked the caller
     * against nobody. It masks nicknames and returns wagering volume already
     * priced in USD, so the only work left here is attaching the prize ladder.
     */
    async getLeaderboard(period): Promise<LeaderboardEntry[]> {
      try {
        const { data, error } = await supabase.rpc("leaderboard", { p_period: period });
        if (error || !data) return [];

        return data.slice(0, RACE_SIZE).map((row) => {
          const rank = Number(row.rank);
          return {
            rank,
            nickname: row.nickname,
            wagered: Number(row.wagered),
            prize: RACE_PRIZE_POOL[rank - 1] ?? 0,
            isCurrentUser: row.is_current_user,
          };
        });
      } catch {
        return [];
      }
    },

    /**
     * Signup counts come from `referral_stats`, which is SECURITY DEFINER: the
     * profiles policy exposes only the caller's own row, so counting referred
     * accounts is impossible from the client. Earnings stay a direct read —
     * they are the caller's own ledger rows.
     */
    async getReferralInfo(): Promise<ReferralInfo> {
      const uid = await currentUserId();
      const empty: ReferralInfo = {
        code: "",
        link: REFERRAL_BASE,
        clicks: 0,
        signups: 0,
        earnings: 0,
        coin: "USDT",
      };
      if (!uid) return empty;

      const { data: profile } = await supabase
        .from("profiles")
        .select("ref_code")
        .eq("id", uid)
        .maybeSingle();
      if (!profile) return empty;

      // Set-returning function: one row, or none if the RPC failed.
      const { data: stats } = await supabase.rpc("referral_stats");
      const signups = Number(stats?.[0]?.signups ?? 0);

      const { data: bonuses } = await supabase
        .from("transactions")
        .select("amount")
        .eq("user_id", uid)
        .eq("type", "bonus")
        .eq("note", "referral");
      const earnings = (bonuses ?? []).reduce((acc, row) => acc + Number(row.amount), 0);

      return {
        code: profile.ref_code,
        link: `${REFERRAL_BASE}/?ref=${profile.ref_code}`,
        // No data source: counting link opens needs an analytics table that the
        // schema does not have. Reported as 0 rather than estimated.
        clicks: 0,
        signups,
        earnings,
        coin: "USDT",
      };
    },
  };
}
