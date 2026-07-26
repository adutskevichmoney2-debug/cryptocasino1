import type {
  BonusService,
  LeaderboardEntry,
  Result,
  ReferralInfo,
  UserBonus,
  VipStatus,
} from "../types";
import { fail, ok } from "../types";
import { LEADERBOARD_NAMES, PROMOTIONS, PROMO_CODES, VIP_LEVELS } from "./fixtures/promotions";
import { currentUserId } from "./auth.mock";
import { dbKeys, dbRead, dbWrite, makeId } from "./db";
import { delay } from "./latency";
import { rngInt, seededRng } from "@/lib/rng";
import { maskNickname } from "@/lib/format";

/** Race periods reset on a fixed schedule; the seed keeps the table stable within one. */
function periodSeed(period: "daily" | "weekly"): string {
  const now = new Date();
  const day = Math.floor(now.getTime() / 86_400_000);
  return period === "daily" ? `d${day}` : `w${Math.floor(day / 7)}`;
}

const PRIZE_POOL = [500, 300, 200, 150, 100, 80, 60, 50, 40, 30, 25, 20, 15, 10, 10, 10, 5, 5, 5, 5];

export function createBonusService(): BonusService {
  const readBonuses = (uid: string) => dbRead<UserBonus[]>(dbKeys.bonuses(uid), []);

  const vipLevelFor = (xp: number) =>
    [...VIP_LEVELS].reverse().find((l) => xp >= l.xpRequired) ?? VIP_LEVELS[0];

  return {
    async getPromotions() {
      await delay(150, 350);
      return PROMOTIONS;
    },

    async getPromotionBySlug(slug) {
      await delay(120, 280);
      return PROMOTIONS.find((p) => p.slug === slug) ?? null;
    },

    async getActiveBonuses() {
      await delay(150, 350);
      const uid = currentUserId();
      if (!uid) return [];
      const now = Date.now();
      return readBonuses(uid).filter((b) => new Date(b.expiresAt).getTime() > now);
    },

    async claimPromoCode(code): Promise<Result<UserBonus>> {
      await delay(500, 900);
      const uid = currentUserId();
      if (!uid) return fail("auth/not-authenticated");

      const normalized = code.trim().toUpperCase();
      const fixture = PROMO_CODES.find((c) => c.code === normalized);
      if (!fixture) return fail("bonus/invalid-code");

      const existing = readBonuses(uid);
      if (existing.some((b) => b.code === normalized)) return fail("bonus/already-claimed");

      const bonus: UserBonus = {
        id: makeId("bns"),
        code: fixture.code,
        key: fixture.key,
        amount: fixture.amount,
        coin: fixture.coin,
        wagerRequired: fixture.amount * fixture.wagerMultiplier,
        wagerDone: 0,
        claimedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + fixture.validDays * 86_400_000).toISOString(),
      };

      dbWrite(dbKeys.bonuses(uid), [bonus, ...existing]);
      return ok(bonus);
    },

    async getVipLevels() {
      return VIP_LEVELS;
    },

    async getVipStatus(): Promise<VipStatus> {
      await delay(150, 350);
      const uid = currentUserId();
      const xp = uid ? dbRead<number>(`cc:db:xp:${uid}`, 0) : 0;
      const level = vipLevelFor(xp);
      const next = VIP_LEVELS.find((l) => l.level === level.level + 1) ?? null;
      const span = next ? next.xpRequired - level.xpRequired : 1;
      const progressPct = next ? Math.min(100, ((xp - level.xpRequired) / span) * 100) : 100;
      return { level, next, xp, progressPct };
    },

    async getLeaderboard(period): Promise<LeaderboardEntry[]> {
      await delay(200, 450);
      const rng = seededRng(`leaderboard:${period}:${periodSeed(period)}`);
      const uid = currentUserId();
      const userWagered = uid ? dbRead<number>(`cc:db:wagered:${uid}`, 0) : 0;

      const rivals = LEADERBOARD_NAMES.map((nickname) => ({
        nickname: maskNickname(nickname),
        wagered: rngInt(rng, 500, period === "daily" ? 18_000 : 90_000),
      }));

      const rows = [...rivals];
      if (uid && userWagered > 0) {
        rows.push({ nickname: maskNickname("You"), wagered: userWagered });
      }

      return rows
        .sort((a, b) => b.wagered - a.wagered)
        .slice(0, 20)
        .map((row, i) => ({
          rank: i + 1,
          nickname: row.nickname,
          wagered: row.wagered,
          prize: PRIZE_POOL[i] ?? 0,
          isCurrentUser: row.nickname === maskNickname("You"),
        }));
    },

    async getReferralInfo(): Promise<ReferralInfo> {
      await delay(150, 350);
      const uid = currentUserId();
      const users = dbRead<{ id: string; refCode: string; referredBy?: string }[]>(dbKeys.users, []);
      const me = users.find((u) => u.id === uid);
      const code = me?.refCode ?? "DEMO2024";
      const signups = users.filter((u) => u.referredBy === code).length;
      const rng = seededRng(`ref:${code}`);

      return {
        code,
        link: `https://cryptocasino.demo/?ref=${code}`,
        clicks: signups * rngInt(rng, 3, 9),
        signups,
        earnings: signups * rngInt(rng, 2, 12),
        coin: "USDT",
      };
    },
  };
}

/** Adds XP and wager volume after a settled bet — drives VIP progress and the race. */
export function addWagerProgress(amount: number): void {
  const uid = currentUserId();
  if (!uid) return;
  dbWrite(`cc:db:xp:${uid}`, dbRead<number>(`cc:db:xp:${uid}`, 0) + Math.round(amount));
  dbWrite(`cc:db:wagered:${uid}`, dbRead<number>(`cc:db:wagered:${uid}`, 0) + amount);
}
