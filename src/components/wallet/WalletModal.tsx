"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { DepositPanel } from "./DepositPanel";
import { WithdrawPanel } from "./WithdrawPanel";

type WalletTab = "deposit" | "withdraw";

export function WalletModal({
  open,
  onClose,
  initialTab = "deposit",
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: WalletTab;
}) {
  const t = useTranslations("wallet");
  const status = useAuthStore((s) => s.status);
  const openModal = useUiStore((s) => s.openModal);
  const [tab, setTab] = useState<WalletTab>(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  const { data: coins } = useAsync(() => services.wallet.getCoins(), []);

  return (
    <Modal open={open} onClose={onClose} size="md" title={t("title")}>
      {status !== "authed" ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-surface-2">
            <Lock className="size-5 text-content-tertiary" />
          </span>
          <p className="text-sm text-content-secondary">{t("loginRequired")}</p>
          <Button
            onClick={() => {
              onClose();
              openModal("login");
            }}
          >
            {t("loginCta")}
          </Button>
        </div>
      ) : (
        <>
          <Tabs
            grow
            className="mb-5"
            value={tab}
            onValueChange={setTab}
            options={[
              { value: "deposit", label: t("deposit") },
              { value: "withdraw", label: t("withdraw") },
            ]}
          />
          {!coins ? (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-11 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : tab === "deposit" ? (
            <DepositPanel coins={coins} />
          ) : (
            <WithdrawPanel coins={coins} />
          )}
        </>
      )}
    </Modal>
  );
}
