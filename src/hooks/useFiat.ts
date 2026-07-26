"use client";

import { useCallback } from "react";
import { useWalletStore } from "@/stores/walletStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { FIAT_RATES } from "@/services/mock/fixtures/coins";
import { formatFiat } from "@/lib/format";
import type { Coin } from "@/services/types";

/** Converts a coin amount into the user's chosen display currency. */
export function useFiat() {
  const rates = useWalletStore((s) => s.rates);
  const fiatCurrency = useSettingsStore((s) => s.fiatCurrency);

  const toFiatValue = useCallback(
    (coin: Coin, amount: number): number => {
      const usd = (rates?.[coin] ?? 0) * amount;
      return usd * FIAT_RATES[fiatCurrency];
    },
    [rates, fiatCurrency],
  );

  const toFiat = useCallback(
    (coin: Coin, amount: number): string => formatFiat(toFiatValue(coin, amount), fiatCurrency),
    [toFiatValue, fiatCurrency],
  );

  return { toFiat, toFiatValue, fiatCurrency };
}
