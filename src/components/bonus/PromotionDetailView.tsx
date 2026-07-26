"use client";

import { useTranslations } from "next-intl";
import { Gift } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { NotFoundContent } from "@/components/shared/NotFoundContent";
import { useRouter } from "@/i18n/navigation";

export function PromotionDetailView({ slug }: { slug: string }) {
  const t = useTranslations("promotions");
  const status = useAuthStore((s) => s.status);
  const openModal = useUiStore((s) => s.openModal);
  const pushToast = useUiStore((s) => s.pushToast);
  const router = useRouter();

  const { data: promotion, loading } = useAsync(
    () => services.bonus.getPromotionBySlug(slug),
    [slug],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!promotion) return <NotFoundContent />;

  const claim = () => {
    if (status !== "authed") {
      pushToast("info", t("loginToClaim"));
      openModal("register");
      return;
    }
    // Promotions map to demo promo codes; send the user to the code input
    router.push("/promotions");
    pushToast("info", t("hintCodes"));
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        className="relative overflow-hidden rounded-xl border border-line p-6 shadow-card sm:p-8"
        style={{
          background: `linear-gradient(135deg, ${promotion.accent}2b, #12161d 65%)`,
        }}
      >
        <div
          className="absolute -right-10 -top-16 size-56 rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: promotion.accent }}
          aria-hidden="true"
        />
        <Gift className="absolute bottom-5 right-6 size-20 opacity-20" style={{ color: promotion.accent }} />

        {promotion.badgeKey && (
          <Badge variant="accent" className="mb-3">
            {t(`badges.${promotion.badgeKey}` as never)}
          </Badge>
        )}
        <h1 className="max-w-lg font-display text-2xl font-extrabold text-content sm:text-3xl">
          {t(`items.${promotion.key}.title` as never)}
        </h1>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-content-secondary">
          {t(`items.${promotion.key}.description` as never)}
        </p>
        <Button size="lg" className="mt-5" onClick={claim}>
          {t("claim")}
        </Button>
      </div>

      <Card className="p-5">
        <h2 className="mb-2 font-display text-base font-bold text-content">{t("termsTitle")}</h2>
        <p className="text-[13px] leading-relaxed text-content-tertiary">{t("termsGeneric")}</p>
      </Card>
    </div>
  );
}
