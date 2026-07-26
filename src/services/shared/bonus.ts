/**
 * VIP and race helpers shared by both backends. The ladder itself is fixture
 * data; only the XP and wager totals feeding it come from storage.
 */

import type { VipStatus } from "../types";
import { VIP_LEVELS } from "../mock/fixtures/promotions";

/** Payout for ranks 1-20 of the wager race, in USD. */
export const RACE_PRIZE_POOL = [
  500, 300, 200, 150, 100, 80, 60, 50, 40, 30, 25, 20, 15, 10, 10, 10, 5, 5, 5, 5,
];

export const RACE_SIZE = RACE_PRIZE_POOL.length;

export function vipStatusFor(xp: number): VipStatus {
  const level = [...VIP_LEVELS].reverse().find((l) => xp >= l.xpRequired) ?? VIP_LEVELS[0];
  const next = VIP_LEVELS.find((l) => l.level === level.level + 1) ?? null;
  const span = next ? next.xpRequired - level.xpRequired : 1;
  const progressPct = next ? Math.min(100, ((xp - level.xpRequired) / span) * 100) : 100;
  return { level, next, xp, progressPct };
}

/** Start of the current race period, in UTC. Weeks begin on Monday. */
export function periodStart(period: "daily" | "weekly"): Date {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  if (period === "weekly") {
    const weekday = (start.getUTCDay() + 6) % 7;
    start.setUTCDate(start.getUTCDate() - weekday);
  }
  return start;
}
