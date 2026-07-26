import type { Game, GameCategoryInfo, GamesService, Paginated, Provider } from "../types";
import {
  GAME_BY_ID,
  GAME_BY_SLUG,
  listCategories,
  listProviders,
  queryGames,
  resolveGameIds,
} from "../shared/games";
import { currentUserId } from "./auth.mock";
import { dbKeys, dbRead, dbWrite } from "./db";
import { delay } from "./latency";

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
      return queryGames(query);
    },

    async getGameBySlug(slug) {
      await delay(120, 300);
      return GAME_BY_SLUG.get(slug) ?? null;
    },

    async getGamesByIds(ids) {
      await delay(100, 240);
      return resolveGameIds(ids);
    },

    async getCategories(): Promise<GameCategoryInfo[]> {
      return listCategories();
    },

    async getProviders(): Promise<Provider[]> {
      return listProviders();
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
      return resolveGameIds(dbRead<string[]>(key, []));
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
  return ids.map((id) => GAME_BY_ID.get(id)).filter((g): g is Game => Boolean(g));
}
