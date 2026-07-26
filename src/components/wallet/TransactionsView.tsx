"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowDownToLine, ArrowUpFromLine, Dice5, Gift, ReceiptText, Trophy } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CoinIcon } from "./CoinIcon";
import { formatCrypto, shortenAddress } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Transaction, TxStatus, TxType } from "@/services/types";

const TYPE_ICON: Record<TxType, React.ComponentType<{ className?: string }>> = {
  deposit: ArrowDownToLine,
  withdraw: ArrowUpFromLine,
  bet: Dice5,
  win: Trophy,
  bonus: Gift,
};

const STATUS_VARIANT: Record<TxStatus, "warning" | "success" | "danger"> = {
  pending: "warning",
  confirmed: "success",
  failed: "danger",
};

function TxRow({ tx }: { tx: Transaction }) {
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const Icon = TYPE_ICON[tx.type];
  const isCredit = tx.type === "deposit" || tx.type === "win" || tx.type === "bonus";

  const typeLabel = {
    deposit: t("txDeposit"),
    withdraw: t("txWithdraw"),
    bet: t("txBet"),
    win: t("txWin"),
    bonus: t("txBonus"),
  }[tx.type];

  const statusLabel = {
    pending: t("txPending"),
    confirmed: t("txConfirmed"),
    failed: t("txFailed"),
  }[tx.status];

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-3">
        <Icon className="size-4 text-content-secondary" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-content">
          {typeLabel}
          {tx.demo && <Badge variant="accent">{tCommon("demo")}</Badge>}
        </p>
        <p className="truncate text-xs text-content-tertiary">
          {format.dateTime(new Date(tx.createdAt), { dateStyle: "medium", timeStyle: "short" })}
          {tx.address && <span className="ml-2 font-mono">{shortenAddress(tx.address)}</span>}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1">
        <p
          className={cn(
            "flex items-center gap-1.5 text-[13px] font-bold tabular-nums",
            isCredit ? "text-success" : "text-content",
          )}
        >
          {isCredit ? "+" : "−"}
          {formatCrypto(tx.amount, 6)}
          <CoinIcon coin={tx.coin} size="sm" />
        </p>
        <Badge variant={STATUS_VARIANT[tx.status]}>{statusLabel}</Badge>
      </div>
    </li>
  );
}

export function TransactionsView() {
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");
  const [type, setType] = useState<"all" | TxType>("all");

  const { data, loading } = useAsync(
    () => services.wallet.getTransactions(type === "all" ? {} : { type }),
    [type],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="no-scrollbar -mx-4 overflow-x-auto px-4">
        <SegmentedControl
          size="sm"
          value={type}
          onValueChange={setType}
          options={[
            { value: "all", label: tCommon("all") },
            { value: "deposit", label: t("txDeposit") },
            { value: "withdraw", label: t("txWithdraw") },
            { value: "bet", label: t("txBet") },
            { value: "win", label: t("txWin") },
            { value: "bonus", label: t("txBonus") },
          ]}
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState icon={ReceiptText} title={t("noTransactions")} description={t("noTransactionsHint")} />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-1">
          {data.items.map((tx) => (
            <TxRow key={tx.id} tx={tx} />
          ))}
        </ul>
      )}
    </div>
  );
}
