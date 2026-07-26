import type { Game, GameCategoryInfo, GamesService, Paginated, Provider } from "../types";
import {
  GAME_BY_SLUG,
  listCategories,
  listProviders,
  queryGames,
  resolveGameIds,
} from "../shared/games";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { currentUserId } from "./auth.supabase";

/** Recently played is a short strip in the UI; the table holds one row per game. */
const RECENT_LIMIT = 20;

export function createGamesService(): GamesService {
  const supabase = getSupabaseBrowserClient();

  return {
    // The catalogue is static fixture data in every backend — see ../shared/games.
    async getGames(query = {}): Promise<Paginated<Game>> {
      return queryGames(query);
    },

    async getGameBySlug(slug) {
      return GAME_BY_SLUG.get(slug) ?? null;
    },

    async getGamesByIds(ids) {
      return resolveGameIds(ids);
    },

    async getCategories(): Promise<GameCategoryInfo[]> {
      return listCategories();
    },

    async getProviders(): Promise<Provider[]> {
      return listProviders();
    },

    async getFavorites() {
      const uid = await currentUserId();
      if (!uid) return [];
      const { data } = await supabase
        .from("favorites")
        .select("game_id")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      return (data ?? []).map((row) => row.game_id);
    },

    async toggleFavorite(gameId) {
      const uid = await currentUserId();
      if (!uid) return false;

      const { data: existing } = await supabase
        .from("favorites")
        .select("game_id")
        .eq("user_id", uid)
        .eq("game_id", gameId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", uid)
          .eq("game_id", gameId);
        return Boolean(error);
      }

      const { error } = await supabase.from("favorites").insert({ user_id: uid, game_id: gameId });
      return !error;
    },

    async getRecentlyPlayed() {
      const uid = await currentUserId();
      if (!uid) return [];
      const { data } = await supabase
        .from("recent_games")
        .select("game_id")
        .eq("user_id", uid)
        .order("played_at", { ascending: false })
        .limit(RECENT_LIMIT);
      return resolveGameIds((data ?? []).map((row) => row.game_id));
    },

    async trackGameOpen(gameId) {
      const uid = await currentUserId();
      if (!uid) return;
      // Primary key is (user_id, game_id): reopening a game moves it to the top
      // rather than adding a second row.
      await supabase
        .from("recent_games")
        .upsert(
          { user_id: uid, game_id: gameId, played_at: new Date().toISOString() },
          { onConflict: "user_id,game_id" },
        );
    },
  };
}
