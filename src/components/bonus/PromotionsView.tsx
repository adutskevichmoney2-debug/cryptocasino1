"use client";

import { useFormatter, useTranslations } from "next-intl";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { BonusCard } from "./BonusCard";
import { PromoCodeInput } from "./PromoCodeInput";
import { formatCrypto } from "@/lib/format";

function ActiveBonuses({ reloadKey }: { reloadKey: number }) {
  const t = useTranslations("promotions");
  const format = useFormatter();
  const status = useAuthStore((s) => s.status);

  const { data: bonuses } = useAsync(
    async () => (status === "authed" ? services.bonus.getActiveBonuses() : []),
    [status, reloadKey],
  );

  if (!bonuses || bonuses.length === 0) return null;

  return (
    <section>
      <SectionHeader title={t("activeBonuses")} />
      <div className="grid gap-3 sm:grid-cols-2">
        {bonuses.map((bonus) => (
          <div key={bonus.id} className="rounded-xl border border-line bg-surface-1 p-4 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-content">
                {t(`bonuses.${bonus.key}` as never)}
              </p>
              <Badge variant="accent">{bonus.code}</Badge>
            </div>
            <p className="mt-1 text-[13px] font-semibold tabular-nums text-success">
              +{formatCrypto(bonus.amount)} {bonus.coin}
            </p>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[11px] font-semibold text-content-tertiary">
                <span>{t("wagering")}</span>
                <span className="tabular-nums">
                  {formatCrypto(bonus.wagerDone)} / {formatCrypto(bonus.wagerRequired)} {bonus.coin}
                </span>
              </div>
              <ProgressBar value={bonus.wagerDone} max={bonus.wagerRequired} />
            </div>
            <p className="mt-2 text-[11px] text-content-disabled">
              {t("expires", {
                date: format.dateTime(new Date(bonus.expiresAt), { dateStyle: "medium" }),
              })}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PromotionsView() {
  const { data: promotions, loading, reload } = useAsync(() => services.bonus.getPromotions(), []);

  return (
    <div className="flex flex-col gap-6">
      <PromoCodeInput onClaimed={() => void reload()} />
      <ActiveBonuses reloadKey={promotions ? 1 : 0} />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(promotions ?? []).map((p) => (
            <BonusCard key={p.slug} promotion={p} />
          ))}
        </div>
      )}
    </div>
  );
}
