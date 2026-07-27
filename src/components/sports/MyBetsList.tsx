"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Ticket } from "lucide-react";
import { services } from "@/services";
import { usePaginatedList } from "@/hooks/usePaginatedList";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadMore } from "@/components/ui/LoadMore";
import { Badge } from "@/components/ui/Badge";
import { CoinIcon } from "@/components/wallet/CoinIcon";
import { formatOdds } from "@/lib/odds";
import { formatCrypto } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Bet, BetStatus } from "@/services/types";

const STATUS_VARIANT: Record<BetStatus, "accent" | "success" | "danger" | "neutral"> = {
  open: "accent",
  won: "success",
  lost: "danger",
  void: "neutral",
};

function BetCard({ bet, compact }: { bet: Bet; compact?: boolean }) {
  const t = useTranslations("sports");
  const format = useFormatter();
  const oddsFormat = useSettingsStore((s) => s.oddsFormat);

  const statusLabel = {
    open: t("open"),
    won: t("won"),
    lost: t("lost"),
    void: t("void"),
  }[bet.status];

  return (
    <div className="rounded-xl border border-line bg-surface-2 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-content-tertiary">
          {bet.type === "combo" ? t("combo") : t("single")}
          <span className="ml-1.5 normal-case tracking-normal text-content-disabled">
            {format.dateTime(new Date(bet.createdAt), { dateStyle: "short", timeStyle: "short" })}
          </span>
        </span>
        <Badge variant={STATUS_VARIANT[bet.status]}>{statusLabel}</Badge>
      </div>

      <ul className={cn("mt-2 space-y-1.5", compact && "space-y-1")}>
        {bet.selections.map((s) => (
          <li key={s.outcomeId} className="flex items-baseline justify-between gap-2 text-[13px]">
            <div className="min-w-0">
              <p className="truncate font-semibold text-content">{s.outcomeLabel}</p>
              <p className="truncate text-[11px] text-content-tertiary">{s.eventLabel}</p>
            </div>
            <span className="shrink-0 font-bold tabular-nums text-content-secondary">
              {formatOdds(s.odds, oddsFormat)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2 text-[13px]">
        <span className="flex items-center gap-1.5 tabular-nums text-content-tertiary">
          {t("stake")}: {formatCrypto(bet.stake, 4)} <CoinIcon coin={bet.coin} size="sm" />
        </span>
        <span
          className={cn(
            "font-bold tabular-nums",
            bet.status === "won" ? "text-success" : bet.status === "lost" ? "text-content-disabled" : "text-content",
          )}
        >
          {bet.status === "lost" ? "—" : `${formatCrypto(bet.potentialWin, 4)} ${bet.coin}`}
        </span>
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export function MyBetsList({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("sports");
  const status = useAuthStore((s) => s.status);
  const [filter, setFilter] = useState<"all" | "open" | "settled">("all");
  const authed = status === "authed";

  const { items, total, loading, loadingMore, loadMore } = usePaginatedList<Bet>(
    async (page) =>
      authed
        ? services.sports.getMyBets(
            filter === "all"
              ? { page, pageSize: PAGE_SIZE }
              : { status: filter, page, pageSize: PAGE_SIZE },
          )
        : null,
    [authed, filter],
  );

  if (!authed) {
    return <EmptyState icon={Ticket} title={t("loginToBet")} className="border-0" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        size="sm"
        value={filter}
        onValueChange={setFilter}
        options={[
          { value: "all", label: t("myBets") },
          { value: "open", label: t("open") },
          { value: "settled", label: t("settled") },
        ]}
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title={t("noBets")}
          description={t("noBetsHint")}
          className={cn(compact && "border-0 py-8")}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-[11px] leading-relaxed">
            <p className="min-w-0 flex-1 text-content-disabled">{t("settleNote")}</p>
            <span className="shrink-0 tabular-nums text-content-tertiary">
              {t("betsCount", { count: total })}
            </span>
          </div>
          <div className="space-y-2">
            {items.map((bet) => (
              <BetCard key={bet.id} bet={bet} compact={compact} />
            ))}
          </div>
          <LoadMore
            size="sm"
            loaded={items.length}
            total={total}
            loading={loadingMore}
            onLoadMore={loadMore}
          />
        </>
      )}
    </div>
  );
}
