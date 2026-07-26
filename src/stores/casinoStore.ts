import { create } from "zustand";
import { services } from "@/services";

interface CasinoState {
  favorites: string[];
  favoritesLoaded: boolean;
  loadFavorites: () => Promise<void>;
  toggleFavorite: (gameId: string) => Promise<void>;
  resetFavorites: () => void;
}

export const useCasinoStore = create<CasinoState>()((set, get) => ({
  favorites: [],
  favoritesLoaded: false,

  async loadFavorites() {
    const favorites = await services.games.getFavorites();
    set({ favorites, favoritesLoaded: true });
  },

  async toggleFavorite(gameId) {
    // Optimistic flip; the service is the source of truth on failure
    const current = get().favorites;
    const next = current.includes(gameId)
      ? current.filter((id) => id !== gameId)
      : [gameId, ...current];
    set({ favorites: next });
    await services.games.toggleFavorite(gameId);
  },

  resetFavorites: () => set({ favorites: [], favoritesLoaded: false }),
}));
