/**
 * Static casino catalogue. Games, providers and categories are fixture data in
 * every backend — they describe the lobby, not the player — so both the mock
 * and the Supabase implementation read them from here instead of the database.
 */

import type { Game, GameCategoryInfo, Paginated, Provider } from "../types";
import { GAMES } from "../mock/fixtures/games";
import { PROVIDERS } from "../mock/fixtures/providers";
import { hashString } from "@/lib/rng";

const PROVIDER_NAMES = new Map(PROVIDERS.map((p) => [p.id, p.name]));

/** Fixtures are enriched once at module load; ids and popularity stay stable. */
export const ALL_GAMES: Game[] = GAMES.map((g, i) => ({
  id: `gm-${i.toString().padStart(3, "0")}`,
  slug: g.slug,
  title: g.title,
  provider: g.provider,
  providerName: PROVIDER_NAMES.get(g.provider) ?? g.provider,
  categories: g.categories,
  rtp: g.rtp,
  volatility: g.volatility,
  isNew: g.categories.includes("new"),
  // Deterministic so ordering never differs between server and client
  popularity: hashString(g.slug) % 10_000,
  // INTEGRATION POINT: a licensed provider supplies a per-session launch URL
  launchUrl: null,
}));

export const GAME_BY_SLUG = new Map(ALL_GAMES.map((g) => [g.slug, g]));
export const GAME_BY_ID = new Map(ALL_GAMES.map((g) => [g.id, g]));

export interface GameQuery {
  category?: string;
  providers?: string[];
  search?: string;
  sort?: "popular" | "new" | "az";
  page?: number;
  pageSize?: number;
}

export function queryGames(query: GameQuery = {}): Paginated<Game> {
  const { category, providers, search, sort = "popular", page = 1, pageSize = 24 } = query;

  let items = ALL_GAMES;
  if (category) items = items.filter((g) => g.categories.includes(category));
  if (providers?.length) items = items.filter((g) => providers.includes(g.provider));
  if (search?.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter(
      (g) => g.title.toLowerCase().includes(q) || g.providerName.toLowerCase().includes(q),
    );
  }

  const sorted = [...items].sort((a, b) => {
    if (sort === "az") return a.title.localeCompare(b.title);
    if (sort === "new") return Number(b.isNew) - Number(a.isNew) || b.popularity - a.popularity;
    return b.popularity - a.popularity;
  });

  return {
    items: sorted.slice((page - 1) * pageSize, page * pageSize),
    total: sorted.length,
    page,
    pageSize,
  };
}

export function listCategories(): GameCategoryInfo[] {
  const counts = new Map<string, number>();
  for (const g of ALL_GAMES) {
    for (const c of g.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [...counts.entries()].map(([slug, count]) => ({ slug, count }));
}

export function listProviders(): Provider[] {
  return PROVIDERS.map((p) => ({
    id: p.id,
    name: p.name,
    gameCount: ALL_GAMES.filter((g) => g.provider === p.id).length,
  })).sort((a, b) => a.name.localeCompare(b.name));
}

/** Game ids resolved to catalogue entries, dropping ids that no longer exist. */
export function resolveGameIds(ids: string[]): Game[] {
  return ids.map((id) => GAME_BY_ID.get(id)).filter((g): g is Game => Boolean(g));
}
