"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ArrowDownToLine, ArrowUpFromLine, Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useCasinoStore } from "@/stores/casinoStore";
import { useUiStore } from "@/stores/uiStore";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCompact } from "@/lib/format";

export function ProfileOverview() {
  const t = useTranslations("profile");
  const tVip = useTranslations("vip");
  const format = useFormatter();
  const user = useAuthStore((s) => s.user);
  const hideStats = useSettingsStore((s) => s.hideStats);
  const favorites = useCasinoStore((s) => s.favorites);
  const openModal = useUiStore((s) => s.openModal);

  const { data: vip } = useAsync(() => services.bonus.getVipStatus(), []);
  const { data: bets } = useAsync(() => services.sports.getMyBets({}), []);
  const { data: bonuses } = useAsync(() => services.bonus.getActiveBonuses(), []);

  if (!user) return null;

  const kycBadge = {
    none: <Badge variant="neutral">{t("kycNone")}</Badge>,
    pending: <Badge variant="warning">{t("kycPending")}</Badge>,
    verified: <Badge variant="success">{t("kycVerified")}</Badge>,
  }[user.kycStatus];

  const stats = [
    { key: "totalBets", value: bets ? String(bets.total) : null },
    { key: "wagered", value: vip ? formatCompact(vip.xp) : null },
    { key: "favorites", value: String(favorites.length) },
    { key: "bonuses", value: bonuses ? String(bonuses.length) : null },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <Avatar nickname={user.nickname} avatarId={user.avatarId} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-extrabold text-content">{user.nickname}</h2>
            {kycBadge}
            {vip && <Badge variant="accent">{t("levelLabel", { level: vip.level.level })}</Badge>}
          </div>
          <p className="mt-1 text-[13px] text-content-tertiary">
            {t("memberSince", {
              date: format.dateTime(new Date(user.createdAt), { dateStyle: "long" }),
            })}
          </p>
          {vip && (
            <div className="mt-3 max-w-sm">
              <div className="mb-1 flex justify-between text-[11px] font-semibold text-content-tertiary">
                <span>{tVip(`levels.${vip.level.key}` as never)}</span>
                {vip.next && <span>{tVip(`levels.${vip.next.key}` as never)}</span>}
              </div>
              <ProgressBar value={vip.progressPct} />
            </div>
          )}
        </div>
        <div className="flex w-full gap-2 sm:w-auto sm:flex-col lg:flex-row">
          <Button size="sm" onClick={() => openModal("wallet", { tab: "deposit" })}>
            <ArrowDownToLine className="size-4" />
            {t("quickDeposit")}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => openModal("wallet", { tab: "withdraw" })}>
            <ArrowUpFromLine className="size-4" />
            {t("quickWithdraw")}
          </Button>
          <Link href="/promotions">
            <Button size="sm" variant="soft" className="w-full">
              <Gift className="size-4" />
              {t("quickBonuses")}
            </Button>
          </Link>
        </div>
      </Card>

      {hideStats ? (
        <Card className="p-5 text-center text-[13px] text-content-tertiary">{t("statsHidden")}</Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.key} className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-content-disabled">
                {t(`stats.${stat.key}`)}
              </p>
              {stat.value === null ? (
                <Skeleton className="mt-1.5 h-7 w-16" />
              ) : (
                <p className="mt-1 font-display text-2xl font-extrabold tabular-nums text-content">
                  {stat.value}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
