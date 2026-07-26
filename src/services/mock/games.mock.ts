import type { Game, GameCategoryInfo, GamesService, Paginated, Provider } from "../types";
import { GAMES } from "./fixtures/games";
import { PROVIDERS } from "./fixtures/providers";
import { currentUserId } from "./auth.mock";
import { dbKeys, dbRead, dbWrite } from "./db";
import { delay } from "./latency";
import { hashString } from "@/lib/rng";

const PROVIDER_NAMES = new Map(PROVIDERS.map((p) => [p.id, p.name]));

/** Fixtures are enriched once at module load; ids and popularity stay stable. */
const ALL_GAMES: Game[] = GAMES.map((g, i) => ({
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

const BY_SLUG = new Map(ALL_GAMES.map((g) => [g.slug, g]));
const BY_ID = new Map(ALL_GAMES.map((g) => [g.id, g]));

export function createGamesService(): GamesService {
  const favKey = () => {
    const uid = currentUserId();
    return uid ? dbKeys.favorites(uid) : null;
  };
  const recentKey = () => {
    const uid = currentUserId();
    return uid ? dbKeys.recent(uid) : null;
  };

  const readFavorites = (): string[] => {
    const key = favKey();
    return key ? dbRead<string[]>(key, []) : [];
  };

  return {
    async getGames(query = {}): Promise<Paginated<Game>> {
      await delay(180, 420);
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
    },

    async getGameBySlug(slug) {
      await delay(120, 300);
      return BY_SLUG.get(slug) ?? null;
    },

    async getCategories(): Promise<GameCategoryInfo[]> {
      const counts = new Map<string, number>();
      for (const g of ALL_GAMES) {
        for (const c of g.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
      }
      return [...counts.entries()].map(([slug, count]) => ({ slug, count }));
    },

    async getProviders(): Promise<Provider[]> {
      return PROVIDERS.map((p) => ({
        id: p.id,
        name: p.name,
        gameCount: ALL_GAMES.filter((g) => g.provider === p.id).length,
      })).sort((a, b) => a.name.localeCompare(b.name));
    },

    async getFavorites() {
      await delay(100, 240);
      return readFavorites();
    },

    async toggleFavorite(gameId) {
      const key = favKey();
      if (!key) return false;
      const current = readFavorites();
      const next = current.includes(gameId)
        ? current.filter((id) => id !== gameId)
        : [gameId, ...current];
      dbWrite(key, next);
      return next.includes(gameId);
    },

    async getRecentlyPlayed() {
      await delay(100, 240);
      const key = recentKey();
      if (!key) return [];
      return dbRead<string[]>(key, [])
        .map((id) => BY_ID.get(id))
        .filter((g): g is Game => Boolean(g));
    },

    async trackGameOpen(gameId) {
      const key = recentKey();
      if (!key) return;
      const current = dbRead<string[]>(key, []).filter((id) => id !== gameId);
      dbWrite(key, [gameId, ...current].slice(0, 20));
    },
  };
}

/** Favorite ids resolved to games — used by the favorites page. */
export function resolveGames(ids: string[]): Game[] {
  return ids.map((id) => BY_ID.get(id)).filter((g): g is Game => Boolean(g));
}
