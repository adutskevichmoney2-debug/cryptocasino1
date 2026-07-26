import { create } from "zustand";
import { persist } from "zustand/middleware";
import { services } from "@/services";
import type { Balance, Coin } from "@/services/types";

interface WalletState {
  balances: Balance[];
  rates: Record<Coin, number> | null;
  activeCoin: Coin;
  showFiat: boolean;
  loading: boolean;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  setActiveCoin: (coin: Coin) => void;
  toggleFiat: () => void;
  balanceOf: (coin: Coin) => number;
}

let subscribed = false;

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      balances: [],
      rates: null,
      activeCoin: "USDT",
      showFiat: false,
      loading: true,

      async init() {
        if (!subscribed) {
          subscribed = true;
          services.wallet.onBalanceChange((balances) => set({ balances }));
        }
        await get().refresh();
      },

      async refresh() {
        const [balances, rates] = await Promise.all([
          services.wallet.getBalances(),
          services.wallet.getRates(),
        ]);
        set({ balances, rates, loading: false });
      },

      setActiveCoin: (activeCoin) => set({ activeCoin }),
      toggleFiat: () => set((s) => ({ showFiat: !s.showFiat })),
      balanceOf: (coin) => get().balances.find((b) => b.coin === coin)?.amount ?? 0,
    }),
    {
      name: "cc:ui:wallet",
      partialize: (s) => ({ activeCoin: s.activeCoin, showFiat: s.showFiat }),
      skipHydration: true,
    },
  ),
);
