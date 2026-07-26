"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { services } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import { useNotificationsStore } from "@/stores/notificationsStore";
import { useUiStore } from "@/stores/uiStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useCasinoStore } from "@/stores/casinoStore";
import { formatCrypto } from "@/lib/format";

/**
 * Rehydrates persisted stores and boots the data layer — client-side only, so
 * the server never renders state that localStorage would contradict.
 */
export function AppInit() {
  const t = useTranslations("wallet");
  const authStatus = useAuthStore((s) => s.status);
  const initAuth = useAuthStore((s) => s.init);
  const initWallet = useWalletStore((s) => s.init);
  const initNotifications = useNotificationsStore((s) => s.init);
  const pushToast = useUiStore((s) => s.pushToast);

  useEffect(() => {
    void useUiStore.persist.rehydrate();
    void useWalletStore.persist.rehydrate();
    void useSettingsStore.persist.rehydrate();
    void initAuth();
  }, [initAuth]);

  // Wallet, notifications and favorites are per-user, so they reload whenever the session changes
  useEffect(() => {
    if (authStatus === "loading") return;
    void initWallet();
    void initNotifications();
    if (authStatus === "authed") {
      void useCasinoStore.getState().loadFavorites();
    } else {
      useCasinoStore.getState().resetFavorites();
    }
  }, [authStatus, initWallet, initNotifications]);

  // Surface pending -> confirmed transitions (withdrawals confirming ~35s later)
  useEffect(() => {
    return services.wallet.onTransactionUpdate((tx) => {
      if (tx.type === "withdraw" && tx.status === "confirmed") {
        const values = { amount: formatCrypto(tx.amount, 6), coin: tx.coin };
        pushToast("success", t("withdrawConfirmed", values));
        void services.notifications.push({ key: "withdrawConfirmed", values });
      }
    });
  }, [t, pushToast]);

  return null;
}
