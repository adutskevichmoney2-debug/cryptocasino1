"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ReceiptText, Ticket, Trash2, X } from "lucide-react";
import { services } from "@/services";
import { useBetslipStore } from "@/stores/betslipStore";
import { useWalletStore } from "@/stores/walletStore";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useServiceError } from "@/hooks/useServiceError";
import { Tabs } from "@/components/ui/Tabs";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { CoinIcon } from "@/components/wallet/CoinIcon";
import { MyBetsList } from "./MyBetsList";
import { formatOdds } from "@/lib/odds";
import { formatCrypto } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useMounted } from "@/hooks/useMounted";

const QUICK_STAKES = [5, 10, 50, 100];

function StakeInput({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  compact?: boolean;
}) {
  const t = useTranslations("sports");
  const activeCoin = useWalletStore((s) => s.activeCoin);

  return (
    <div className={cn("flex flex-col gap-1.5", compact && "gap-1")}>
      <div className="flex h-10 items-center gap-2 rounded-md border border-line-strong bg-surface-2 px-3 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft">
        <input
          inputMode="decimal"
          placeholder={t("stake")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full min-w-0 bg-transparent text-sm tabular-nums text-content outline-none placeholder:text-content-disabled"
        />
        <CoinIcon coin={activeCoin} size="sm" />
      </div>
      {!compact && (
        <div className="flex gap-1.5">
          {QUICK_STAKES.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => onChange(String(q))}
              className="flex-1 cursor-pointer rounded-md bg-surface-3 py-1 text-xs font-bold tabular-nums text-content-secondary transition-colors duration-120 hover:bg-surface-4 hover:text-content"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BetslipContent() {
  const t = useTranslations("sports");
  const translateError = useServiceError();
  const oddsFormat = useSettingsStore((s) => s.oddsFormat);
  const selections = useBetslipStore((s) => s.selections);
  const mode = useBetslipStore((s) => s.mode);
  const setMode = useBetslipStore((s) => s.setMode);
  const comboStake = useBetslipStore((s) => s.comboStake);
  const setComboStake = useBetslipStore((s) => s.setComboStake);
  const singleStakes = useBetslipStore((s) => s.singleStakes);
  const setSingleStake = useBetslipStore((s) => s.setSingleStake);
  const remove = useBetslipStore((s) => s.remove);
  const clear = useBetslipStore((s) => s.clear);
  const changedOdds = useBetslipStore((s) => s.changedOdds);
  const acknowledgeOdds = useBetslipStore((s) => s.acknowledgeOdds);

  const status = useAuthStore((s) => s.status);
  const activeCoin = useWalletStore((s) => s.activeCoin);
  const balanceOf = useWalletStore((s) => s.balanceOf);
  const refreshWallet = useWalletStore((s) => s.refresh);
  const openModal = useUiStore((s) => s.openModal);
  const pushToast = useUiStore((s) => s.pushToast);

  const [tab, setTab] = useState<"slip" | "bets">("slip");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tMarkets = useTranslations("sports.markets");
  const marketLabel = (key: string) => {
    try {
      return tMarkets(key as never);
    } catch {
      return key;
    }
  };

  const totalOdds = selections.reduce((acc, s) => acc * s.odds, 1);
  const comboStakeNum = Number(comboStake.replace(",", ".")) || 0;
  const singlesTotal = selections.reduce(
    (acc, s) => acc + (Number((singleStakes[s.outcomeId] ?? "").replace(",", ".")) || 0),
    0,
  );

  const placeBets = async () => {
    if (status !== "authed") {
      openModal("login");
      return;
    }
    setError(null);

    const totalStake = mode === "combo" ? comboStakeNum : singlesTotal;
    if (!Number.isFinite(totalStake) || totalStake <= 0) {
      setError(translateError({ code: "bets/invalid-stake" }));
      return;
    }
    if (totalStake > balanceOf(activeCoin)) {
      setError(translateError({ code: "wallet/insufficient-funds" }));
      return;
    }

    setPlacing(true);
    // Debit first; refund if the book rejects the slip
    const debit = await services.wallet.applyDelta({
      coin: activeCoin,
      amount: -totalStake,
      type: "bet",
    });
    if (!debit.ok) {
      setPlacing(false);
      setError(translateError(debit.error));
      return;
    }

    const requests =
      mode === "combo"
        ? [services.sports.placeBet({ selections, stake: comboStakeNum, coin: activeCoin, type: "combo" })]
        : selections
            .filter((s) => (Number((singleStakes[s.outcomeId] ?? "").replace(",", ".")) || 0) > 0)
            .map((s) =>
              services.sports.placeBet({
                selections: [s],
                stake: Number((singleStakes[s.outcomeId] ?? "").replace(",", ".")),
                coin: activeCoin,
                type: "single",
              }),
            );

    const results = await Promise.all(requests);
    const failed = results.find((r) => !r.ok);
    setPlacing(false);

    if (failed && !failed.ok) {
      await services.wallet.applyDelta({ coin: activeCoin, amount: totalStake, type: "win" });
      setError(translateError(failed.error));
      return;
    }

    clear();
    void refreshWallet();
    pushToast("success", t("betPlaced"));
    setTab("bets");
  };

  return (
    <div className="flex h-full flex-col">
      <Tabs
        grow
        value={tab}
        onValueChange={setTab}
        options={[
          { value: "slip", label: `${t("betslip")}${selections.length ? ` (${selections.length})` : ""}` },
          { value: "bets", label: t("myBets") },
        ]}
      />

      {tab === "bets" ? (
        <div className="min-h-0 flex-1 overflow-y-auto pt-3">
          <MyBetsList compact />
        </div>
      ) : selections.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-center">
          <Ticket className="size-6 text-content-disabled" />
          <p className="text-sm font-semibold text-content">{t("emptySlip")}</p>
          <p className="max-w-[240px] text-[13px] text-content-tertiary">{t("emptySlipHint")}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between pt-3">
            <SegmentedControl
              size="sm"
              value={mode}
              onValueChange={setMode}
              options={[
                { value: "combo", label: t("combo") },
                { value: "single", label: t("single") },
              ]}
            />
            <button
              type="button"
              onClick={clear}
              className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-content-tertiary transition-colors duration-120 hover:text-danger"
            >
              <Trash2 className="size-3.5" />
              {t("clearAll")}
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-3">
            {selections.map((s) => (
              <div
                key={s.outcomeId}
                className={cn(
                  "rounded-xl border border-line bg-surface-2 p-3",
                  changedOdds.includes(s.outcomeId) && "border-warning/50",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-content">{s.outcomeLabel}</p>
                    <p className="mt-0.5 truncate text-[11px] text-content-tertiary">
                      {marketLabel(s.marketKey)} · {s.eventLabel}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={cn(
                        "text-[13px] font-bold tabular-nums",
                        changedOdds.includes(s.outcomeId) ? "text-warning" : "text-content",
                      )}
                    >
                      {formatOdds(s.odds, oddsFormat)}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(s.outcomeId)}
                      aria-label={t("clearAll")}
                      className="cursor-pointer text-content-disabled transition-colors duration-120 hover:text-danger"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                </div>
                {mode === "single" && (
                  <div className="mt-2">
                    <StakeInput
                      compact
                      value={singleStakes[s.outcomeId] ?? ""}
                      onChange={(v) => setSingleStake(s.outcomeId, v)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {changedOdds.length > 0 && (
            <button
              type="button"
              onClick={acknowledgeOdds}
              className="mb-2 w-full cursor-pointer rounded-lg bg-warning-soft py-2 text-xs font-semibold text-warning transition-colors duration-120 hover:bg-warning/20"
            >
              {t("oddsChanged")} — {t("acceptChanges")}
            </button>
          )}

          <div className="shrink-0 space-y-3 border-t border-line pt-3">
            {mode === "combo" && <StakeInput value={comboStake} onChange={setComboStake} />}

            <div className="space-y-1.5 text-[13px]">
              {mode === "combo" && (
                <div className="flex justify-between">
                  <span className="text-content-tertiary">{t("totalOdds")}</span>
                  <span className="font-bold tabular-nums text-content">
                    {formatOdds(totalOdds, oddsFormat)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-content-tertiary">{t("potentialWin")}</span>
                <span className="font-bold tabular-nums text-success">
                  {mode === "combo"
                    ? formatCrypto(comboStakeNum * totalOdds, 4)
                    : formatCrypto(
                        selections.reduce(
                          (acc, s) =>
                            acc +
                            (Number((singleStakes[s.outcomeId] ?? "").replace(",", ".")) || 0) * s.odds,
                          0,
                        ),
                        4,
                      )}{" "}
                  {activeCoin}
                </span>
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">
                {error}
              </p>
            )}

            <Button
              full
              size="lg"
              loading={placing}
              disabled={changedOdds.length > 0}
              onClick={placeBets}
            >
              {status === "authed" ? t("placeBet") : t("loginToBet")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

/** Desktop: sticky right rail. Mobile: floating button + bottom drawer. */
export function BetslipRail() {
  const t = useTranslations("sports");
  return (
    <aside className="sticky top-20 hidden h-[calc(100dvh-6rem)] w-[340px] shrink-0 flex-col rounded-xl border border-line bg-surface-1 p-4 shadow-card xl:flex">
      <span className="sr-only">{t("betslip")}</span>
      <BetslipContent />
    </aside>
  );
}

export function BetslipMobile() {
  const t = useTranslations("sports");
  const mounted = useMounted();
  const selections = useBetslipStore((s) => s.selections);
  const isOpen = useBetslipStore((s) => s.isOpen);
  const setOpen = useBetslipStore((s) => s.setOpen);

  return (
    <>
      {mounted && selections.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] right-4 z-40 flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-[13px] font-bold text-accent-content shadow-raised xl:hidden"
        >
          <ReceiptText className="size-4" />
          {t("betslip")}
          <span className="flex size-5 items-center justify-center rounded-full bg-black/20 text-[11px] tabular-nums">
            {selections.length}
          </span>
        </button>
      )}

      <Drawer open={isOpen} onClose={() => setOpen(false)} side="bottom" title={t("betslip")}>
        <div className="h-[65dvh]">
          <BetslipContent />
        </div>
      </Drawer>
    </>
  );
}
