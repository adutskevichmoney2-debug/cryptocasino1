"use client";

import { useTranslations } from "next-intl";
import { MousePointerClick, UserPlus, Wallet } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { Card } from "@/components/ui/Card";
import { CopyField } from "@/components/ui/CopyField";
import { Skeleton } from "@/components/ui/Skeleton";

export function ReferralsView() {
  const t = useTranslations("profile.referrals");
  const { data: info, loading } = useAsync(() => services.bonus.getReferralInfo(), []);

  if (loading || !info) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  const stats = [
    { icon: MousePointerClick, label: t("clicks"), value: String(info.clicks) },
    { icon: UserPlus, label: t("signups"), value: String(info.signups) },
    { icon: Wallet, label: t("earnings"), value: `${info.earnings} ${info.coin}` },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <h2 className="font-display text-lg font-bold text-content">{t("title")}</h2>
        <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-content-tertiary">{t("hint")}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-content-secondary">{t("yourLink")}</p>
            <CopyField value={info.link} />
          </div>
          <div>
            <p className="mb-1.5 text-[13px] font-medium text-content-secondary">{t("yourCode")}</p>
            <CopyField value={info.code} className="sm:w-40" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center gap-3 p-4">
            <span className="flex size-10 items-center justify-center rounded-lg bg-accent-soft">
              <stat.icon className="size-5 text-accent" />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-content-disabled">
                {stat.label}
              </p>
              <p className="font-display text-lg font-extrabold tabular-nums text-content">
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
