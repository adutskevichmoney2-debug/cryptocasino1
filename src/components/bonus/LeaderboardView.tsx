"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Timer, Trophy } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useCountdown } from "@/hooks/useCountdown";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCompact } from "@/lib/format";
import { cn } from "@/lib/cn";

const MEDAL_COLORS = ["#e3b341", "#a8b2c2", "#b0785a"];

function periodEnd(period: "daily" | "weekly"): number {
  const now = new Date();
  if (period === "daily") {
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    return end.getTime();
  }
  const end = new Date(now);
  const day = (end.getDay() + 6) % 7; // Monday = 0
  end.setDate(end.getDate() + (7 - day));
  end.setHours(0, 0, 0, 0);
  return end.getTime();
}

function RaceCountdown({ period }: { period: "daily" | "weekly" }) {
  const t = useTranslations("leaderboard");
  const [target, setTarget] = useState(() => periodEnd(period));
  const parts = useCountdown(target);

  useEffect(() => setTarget(periodEnd(period)), [period]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
      <Timer className="size-4 text-accent" />
      <span className="text-[13px] font-semibold text-content-secondary">{t("endsIn")}</span>
      <span className="font-display text-[13px] font-bold tabular-nums text-content">
        {parts.days > 0 && `${parts.days}d `}
        {pad(parts.hours)}:{pad(parts.minutes)}:{pad(parts.seconds)}
      </span>
    </div>
  );
}

export function LeaderboardView() {
  const t = useTranslations("leaderboard");
  const [period, setPeriod] = useState<"daily" | "weekly">("weekly");

  const { data: rows, loading } = useAsync(
    () => services.bonus.getLeaderboard(period),
    [period],
  );

  const entries = rows ?? [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          value={period}
          onValueChange={setPeriod}
          options={[
            { value: "daily", label: t("daily") },
            { value: "weekly", label: t("weekly") },
          ]}
        />
        <RaceCountdown period={period} />
      </div>

      {loading ? (
        <Skeleton className="h-[560px] w-full rounded-xl" />
      ) : entries.length === 0 ? (
        <EmptyState icon={Trophy} title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface-1">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line text-[11px] font-bold uppercase tracking-wider text-content-disabled">
                <th className="w-14 px-4 py-3">{t("rank")}</th>
                <th className="px-4 py-3">{t("player")}</th>
                <th className="px-4 py-3 text-right">{t("wagered")}</th>
                <th className="px-4 py-3 text-right">{t("prize")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entries.map((row) => (
                <tr key={row.rank} className={cn(row.isCurrentUser && "bg-accent-soft/40")}>
                  <td className="px-4 py-2.5">
                    {row.rank <= 3 ? (
                      <Trophy className="size-4" style={{ color: MEDAL_COLORS[row.rank - 1] }} />
                    ) : (
                      <span className="tabular-nums text-content-tertiary">{row.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-semibold text-content">
                    {row.nickname}
                    {row.isCurrentUser && (
                      <Badge variant="accent" className="ml-2">
                        {t("you")}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-content-secondary">
                    ${formatCompact(row.wagered)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold tabular-nums text-success">
                    {row.prize > 0 ? `${row.prize}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-content-disabled">{t("prizeNote")}</p>
    </div>
  );
}
