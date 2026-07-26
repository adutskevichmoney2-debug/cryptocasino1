import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OddsFormat = "decimal" | "fractional" | "american";

interface SettingsState {
  oddsFormat: OddsFormat;
  hideStats: boolean;
  reduceMotion: boolean;
  setOddsFormat: (format: OddsFormat) => void;
  setHideStats: (hide: boolean) => void;
  setReduceMotion: (reduce: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      oddsFormat: "decimal",
      hideStats: false,
      reduceMotion: false,
      setOddsFormat: (oddsFormat) => set({ oddsFormat }),
      setHideStats: (hideStats) => set({ hideStats }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: "cc:ui:settings", skipHydration: true },
  ),
);
