import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { FiatCurrency } from "@/services/mock/fixtures/coins";

export type OddsFormat = "decimal" | "fractional" | "american";

interface SettingsState {
  oddsFormat: OddsFormat;
  fiatCurrency: FiatCurrency;
  hideStats: boolean;
  reduceMotion: boolean;
  setOddsFormat: (format: OddsFormat) => void;
  setFiatCurrency: (currency: FiatCurrency) => void;
  setHideStats: (hide: boolean) => void;
  setReduceMotion: (reduce: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      oddsFormat: "decimal",
      fiatCurrency: "USD",
      hideStats: false,
      reduceMotion: false,
      setOddsFormat: (oddsFormat) => set({ oddsFormat }),
      setFiatCurrency: (fiatCurrency) => set({ fiatCurrency }),
      setHideStats: (hideStats) => set({ hideStats }),
      setReduceMotion: (reduceMotion) => set({ reduceMotion }),
    }),
    { name: "cc:ui:settings", skipHydration: true },
  ),
);
