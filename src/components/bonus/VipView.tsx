"use client";

import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useAuthStore } from "@/stores/authStore";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/cn";

const LEVEL_COLORS: Record<string, string> = {
  bronze: "#b0785a",
  silver: "#a8b2c2",
  gold: "#e3b341",
  platinum: "#9ad8d8",
  diamond: "#7fb8ff",
};

export function VipView() {
  const t = useTranslations("vip");
  const status = useAuthStore((s) => s.status);

  const { data: levels } = useAsync(() => services.bonus.getVipLevels(), []);
  const { data: vip, loading } = useAsync(
    async () => (status === "authed" ? services.bonus.getVipStatus() : null),
    [status],
  );

  return (
    <div className="flex flex-col gap-5">
      {status === "authed" ? (
        loading || !vip ? (
          <Skeleton className="h-36 w-full rounded-xl" />
        ) : (
          <Card className="relative overflow-hidden p-6">
            <div
              className="absolute -right-10 -top-16 size-52 rounded-full opacity-15 blur-3xl"
              style={{ backgroundColor: LEVEL_COLORS[vip.level.key] }}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center gap-4">
              <span
                className="flex size-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${LEVEL_COLORS[vip.level.key]}26` }}
              >
                <Crown className="size-7" style={{ color: LEVEL_COLORS[vip.level.key] }} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-content-disabled">
                  {t("yourLevel")}
                </p>
                <p className="font-display text-xl font-extrabold text-content">
                  {t(`levels.${vip.level.key}` as never)}
                  <span className="ml-2 text-sm font-semibold text-content-tertiary">
                    {t("xpLabel", { xp: formatCompact(vip.xp) })}
                  </span>
                </p>
              </div>
              <Badge variant="accent">{vip.level.cashbackPct}%</Badge>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-[11px] font-semibold text-content-tertiary">
                <span>{t(`levels.${vip.level.key}` as never)}</span>
                <span>
                  {vip.next
                    ? t("nextLevel", { level: t(`levels.${vip.next.key}` as never) })
                    : t("maxLevel")}
                </span>
              </div>
              <ProgressBar value={vip.progressPct} />
            </div>
          </Card>
        )
      ) : (
        <Card className="p-6 text-center text-[13px] text-content-tertiary">{t("loginHint")}</Card>
      )}

      <section>
        <h2 className="mb-3 font-display text-lg font-bold text-content">{t("levelsTable")}</h2>
        <div className="overflow-hidden rounded-xl border border-line bg-surface-1">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-content-disabled">
                <th className="px-4 py-3">{t("level")}</th>
                <th className="px-4 py-3 text-right">{t("xpRequired")}</th>
                <th className="px-4 py-3 text-right">{t("cashbackCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(levels ?? []).map((level) => {
                const active = vip?.level.level === level.level;
                return (
                  <tr key={level.level} className={cn(active && "bg-accent-soft/40")}>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5 font-semibold text-content">
                        <Crown className="size-4" style={{ color: LEVEL_COLORS[level.key] }} />
                        {t(`levels.${level.key}` as never)}
                        {active && (
                          <Badge variant="accent" className="ml-1">
                            {t("yourLevel")}
                          </Badge>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-content-secondary">
                      {level.xpRequired.toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-success">
                      {level.cashbackPct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
