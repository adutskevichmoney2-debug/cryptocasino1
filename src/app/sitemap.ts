import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { CASINO_CATEGORIES, LEGAL_SLUGS, SPORT_SLUGS } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const STATIC_PATHS = [
  "",
  "/casino",
  "/sports",
  "/sports/live",
  "/promotions",
  "/vip",
  "/leaderboard",
  "/provably-fair",
  "/help",
  "/help/contact",
  ...CASINO_CATEGORIES.map((c) => `/casino/category/${c}`),
  ...SPORT_SLUGS.map((s) => `/sports/${s}`),
  ...LEGAL_SLUGS.map((s) => `/legal/${s}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: `${BASE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}${path}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
