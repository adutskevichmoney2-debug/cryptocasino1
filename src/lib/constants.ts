export const LAYOUT = {
  headerHeight: 64,
  sidebarWidth: 240,
  sidebarRailWidth: 68,
  mobileTabBarHeight: 60,
  contentMaxWidth: 1284,
} as const;

export const CASINO_CATEGORIES = [
  "slots",
  "live",
  "game-shows",
  "originals",
  "table",
  "new",
  "popular",
] as const;
export type CasinoCategory = (typeof CASINO_CATEGORIES)[number];

export const SPORT_SLUGS = [
  "football",
  "basketball",
  "tennis",
  "hockey",
  "esports",
  "mma",
  "volleyball",
  "table-tennis",
] as const;
export type SportSlug = (typeof SPORT_SLUGS)[number];

export const LEGAL_SLUGS = ["terms", "privacy", "responsible-gambling", "aml"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];
