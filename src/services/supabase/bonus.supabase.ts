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
import { periodStart, RACE_PRIZE_POOL, RACE_SIZE, vipStatusFor } from "../shared/bonus";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserBonusRow } from "@/lib/supabase/types";
import { maskNickname } from "@/lib/format";
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
     * Aggregated client-side from `bets`. The bets and profiles RLS policies
     * scope reads to the caller, so an ordinary player currently only ranks
     * themselves — a leaderboard view or SECURITY DEFINER aggregate is the
     * server-side piece still to be added.
     */
    async getLeaderboard(period): Promise<LeaderboardEntry[]> {
      const uid = await currentUserId();
      const { data } = await supabase
        .from("bets")
        .select("user_id, stake")
        .gte("created_at", periodStart(period).toISOString());

      const totals = new Map<string, number>();
      for (const row of data ?? []) {
        totals.set(row.user_id, (totals.get(row.user_id) ?? 0) + Number(row.stake));
      }

      const ranked = [...totals.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, RACE_SIZE);
      if (ranked.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, nickname")
        .in(
          "id",
          ranked.map(([id]) => id),
        );
      const nicknames = new Map((profiles ?? []).map((p) => [p.id, p.nickname]));

      return ranked.map(([userId, wagered], i) => ({
        rank: i + 1,
        nickname: maskNickname(nicknames.get(userId) ?? "player"),
        wagered,
        prize: RACE_PRIZE_POOL[i] ?? 0,
        isCurrentUser: userId === uid,
      }));
    },

    /**
     * Signups are counted from `profiles.referred_by`. The profiles policy only
     * exposes the caller's own row, so this reads 0 until a counter column or a
     * SECURITY DEFINER function exposes the aggregate.
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

      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("referred_by", profile.ref_code);
      const signups = count ?? 0;

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
        // Click-through tracking needs an analytics table that does not exist yet.
        clicks: 0,
        signups,
        earnings,
        coin: "USDT",
      };
    },
  };
}
