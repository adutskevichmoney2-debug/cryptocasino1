import type { Coin, Promotion, VipLevel } from "../../types";

export const PROMOTIONS: Promotion[] = [
  { slug: "welcome-package", key: "welcome", kind: "welcome", badgeKey: "hot", accent: "#10b981" },
  { slug: "weekly-cashback", key: "cashback", kind: "cashback", accent: "#38bdf8" },
  { slug: "free-spins-friday", key: "freeSpins", kind: "freespins", badgeKey: "new", accent: "#a78bfa" },
  { slug: "reload-bonus", key: "reload", kind: "reload", accent: "#fbbf24" },
  { slug: "accumulator-boost", key: "accaBoost", kind: "sport", accent: "#f472b6" },
  { slug: "risk-free-bet", key: "riskFree", kind: "sport", badgeKey: "sport", accent: "#2dd4bf" },
];

export interface PromoCodeFixture {
  code: string;
  /** Translation key inside `promotions.bonuses`. */
  key: string;
  amount: number;
  coin: Coin;
  /** Multiplier applied to the bonus amount to compute the wagering target. */
  wagerMultiplier: number;
  validDays: number;
}

export const PROMO_CODES: PromoCodeFixture[] = [
  { code: "WELCOME100", key: "welcomeBonus", amount: 100, coin: "USDT", wagerMultiplier: 25, validDays: 14 },
  { code: "FREESPINS50", key: "freeSpinsBonus", amount: 50, coin: "USDT", wagerMultiplier: 30, validDays: 7 },
  { code: "CASHBACK10", key: "cashbackBonus", amount: 10, coin: "USDT", wagerMultiplier: 5, validDays: 3 },
  { code: "SPORT25", key: "sportBonus", amount: 25, coin: "USDT", wagerMultiplier: 10, validDays: 7 },
];

export const VIP_LEVELS: VipLevel[] = [
  { level: 1, key: "bronze", xpRequired: 0, cashbackPct: 2 },
  { level: 2, key: "silver", xpRequired: 1_000, cashbackPct: 4 },
  { level: 3, key: "gold", xpRequired: 5_000, cashbackPct: 6 },
  { level: 4, key: "platinum", xpRequired: 20_000, cashbackPct: 8 },
  { level: 5, key: "diamond", xpRequired: 75_000, cashbackPct: 12 },
];

/** Seeded opponents for the weekly race table. */
export const LEADERBOARD_NAMES = [
  "NovaStrike",
  "QuietRiver",
  "AceOfSpins",
  "LunarFox",
  "IronBet",
  "PixelDrifter",
  "SilentWager",
  "EmberKing",
  "BlueHarbor",
  "RogueCipher",
  "MidnightOwl",
  "CopperLine",
  "SwiftMarlin",
  "GraniteWolf",
  "NeonPilgrim",
  "AmberTide",
  "ZeroGravity",
  "SableCrown",
  "VelvetRush",
  "HollowPine",
];
