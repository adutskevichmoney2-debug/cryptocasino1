"use client";

import { useTranslations } from "next-intl";
import { Gift } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Promotion } from "@/services/types";

/** Gradient-art promo card; the artwork is pure CSS derived from the accent. */
export function BonusCard({ promotion }: { promotion: Promotion }) {
  const t = useTranslations("promotions");

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-line bg-surface-1 shadow-card transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong">
      <div
        className="relative h-32 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${promotion.accent}26, ${promotion.accent}0d 60%, transparent)`,
        }}
      >
        <div
          className="absolute -right-6 -top-10 size-40 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
          style={{ backgroundColor: promotion.accent }}
          aria-hidden="true"
        />
        <Gift
          className="absolute bottom-4 right-4 size-14 opacity-30"
          style={{ color: promotion.accent }}
          aria-hidden="true"
        />
        {promotion.badgeKey && (
          <Badge variant="accent" className="absolute left-3 top-3">
            {t(`badges.${promotion.badgeKey}` as never)}
          </Badge>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-bold text-content">
          {t(`items.${promotion.key}.title` as never)}
        </h3>
        <p className="flex-1 text-[13px] leading-relaxed text-content-tertiary">
          {t(`items.${promotion.key}.description` as never)}
        </p>
        <Link href={`/promotions/${promotion.slug}`} className="mt-1">
          <Button variant="soft" size="sm" full>
            {t("details")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
