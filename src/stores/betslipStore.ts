import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BetSelection, OddsUpdate } from "@/services/types";

export type BetslipMode = "single" | "combo";

interface BetslipState {
  selections: BetSelection[];
  mode: BetslipMode;
  comboStake: string;
  singleStakes: Record<string, string>;
  isOpen: boolean;
  /** Outcome ids whose odds moved since being added — shown highlighted. */
  changedOdds: string[];

  toggle: (selection: BetSelection) => void;
  remove: (outcomeId: string) => void;
  clear: () => void;
  has: (outcomeId: string) => boolean;
  setMode: (mode: BetslipMode) => void;
  setComboStake: (stake: string) => void;
  setSingleStake: (outcomeId: string, stake: string) => void;
  setOpen: (open: boolean) => void;
  applyOddsUpdates: (updates: OddsUpdate[]) => void;
  acknowledgeOdds: () => void;
}

export const useBetslipStore = create<BetslipState>()(
  persist(
    (set, get) => ({
      selections: [],
      mode: "combo",
      comboStake: "",
      singleStakes: {},
      isOpen: false,
      changedOdds: [],

      toggle(selection) {
        const { selections } = get();
        if (selections.some((s) => s.outcomeId === selection.outcomeId)) {
          get().remove(selection.outcomeId);
          return;
        }
        set({
          // One selection per market: picking another outcome replaces it
          selections: [
            ...selections.filter((s) => s.marketId !== selection.marketId),
            selection,
          ],
          isOpen: true,
        });
      },

      remove(outcomeId) {
        set((s) => ({
          selections: s.selections.filter((sel) => sel.outcomeId !== outcomeId),
          changedOdds: s.changedOdds.filter((id) => id !== outcomeId),
        }));
      },

      clear: () => set({ selections: [], changedOdds: [], comboStake: "", singleStakes: {} }),

      has: (outcomeId) => get().selections.some((s) => s.outcomeId === outcomeId),

      setMode: (mode) => set({ mode }),
      setComboStake: (comboStake) => set({ comboStake }),
      setSingleStake: (outcomeId, stake) =>
        set((s) => ({ singleStakes: { ...s.singleStakes, [outcomeId]: stake } })),
      setOpen: (isOpen) => set({ isOpen }),

      applyOddsUpdates(updates) {
        const { selections } = get();
        const affected = updates.filter((u) => selections.some((s) => s.outcomeId === u.outcomeId));
        if (affected.length === 0) return;
        set((s) => ({
          selections: s.selections.map((sel) => {
            const update = affected.find((u) => u.outcomeId === sel.outcomeId);
            return update ? { ...sel, odds: update.odds } : sel;
          }),
          changedOdds: [
            ...new Set([...s.changedOdds, ...affected.map((u) => u.outcomeId)]),
          ],
        }));
      },

      acknowledgeOdds: () => set({ changedOdds: [] }),
    }),
    {
      name: "cc:ui:betslip",
      partialize: (s) => ({
        selections: s.selections,
        mode: s.mode,
        comboStake: s.comboStake,
        singleStakes: s.singleStakes,
      }),
      skipHydration: true,
    },
  ),
);
