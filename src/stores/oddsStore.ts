import { create } from "zustand";
import type { OddsUpdate } from "@/services/types";

interface OddsOverride {
  odds: number;
  direction: "up" | "down";
}

interface OddsState {
  /** Live odds overrides keyed by outcome id, fed by subscribeOdds. */
  overrides: Record<string, OddsOverride>;
  apply: (updates: OddsUpdate[]) => void;
}

export const useOddsStore = create<OddsState>()((set) => ({
  overrides: {},
  apply: (updates) =>
    set((s) => {
      const next = { ...s.overrides };
      for (const u of updates) next[u.outcomeId] = { odds: u.odds, direction: u.direction };
      return { overrides: next };
    }),
}));
