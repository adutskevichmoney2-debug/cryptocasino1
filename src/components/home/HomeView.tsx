"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, ArrowUpFromLine, Headset, ShieldCheck, TrendingUp, Zap, Gift, Radio } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useMounted } from "@/hooks/useMounted";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GameRow } from "@/components/casino/GameRow";
import { EventList } from "@/components/sports/EventRow";
import { BonusCard } from "@/components/bonus/BonusCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { LogoMark } from "@/components/ui/Logo";

const FEATURES = [
  { key: "featureInstant", icon: Zap },
  { key: "featureFair", icon: ShieldCheck },
  { key: "featureWithdraw", icon: ArrowUpFromLine },
  { key: "featureSupport", icon: Headset },
] as const;

function Hero() {
  const t = useTranslations("home");
  const status = useAuthStore((s) => s.status);
  const openModal = useUiStore((s) => s.openModal);
  const mounted = useMounted();

  return (
    <section className="relative overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-card">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-accent opacity-[0.14] blur-3xl"
        aria-hidden="true"
      />
      <LogoMark className="pointer-events-none absolute -bottom-10 -right-6 size-56 opacity-[0.06] max-sm:hidden" />

      <div className="relative px-6 py-10 sm:px-10 sm:py-14">
        <h1 className="max-w-xl font-display text-3xl font-extrabold leading-tight text-content sm:text-4xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-content-secondary sm:text-[15px]">
          {t("heroSubtitle")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {mounted && status !== "authed" && (
            <Button size="lg" onClick={() => openModal("register")}>
              {t("heroCtaRegister")}
            </Button>
          )}
          <Link href="/casino">
            <Button size="lg" variant={mounted && status === "authed" ? "primary" : "secondary"}>
              {t("heroCtaCasino")}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeView() {
  const t = useTranslations("home");

  const { data: popular, loading: loadingGames } = useAsync(
    () => services.games.getGames({ category: "popular", pageSize: 14 }),
    [],
  );
  const { data: live } = useAsync(() => services.sports.getEvents({ live: true, limit: 4 }), []);
  const { data: promotions } = useAsync(() => services.bonus.getPromotions(), []);

  return (
    <div className="flex flex-col gap-8">
      <Hero />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.key}
            className="flex items-center gap-3 rounded-xl border border-line bg-surface-1 px-4 py-3.5 shadow-card"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
              <feature.icon className="size-[18px] text-accent" />
            </span>
            <p className="text-[13px] font-semibold leading-snug text-content">{t(feature.key)}</p>
          </div>
        ))}
      </section>

      <section>
        <SectionHeader title={t("popularGames")} icon={TrendingUp} href="/casino/category/popular" />
        <GameRow games={popular?.items ?? []} loading={loadingGames} />
      </section>

      <section>
        <SectionHeader title={t("liveSports")} icon={Radio} href="/sports/live" />
        {!live ? (
          <Skeleton className="h-72 w-full rounded-xl" />
        ) : (
          <EventList events={live} />
        )}
        <div className="mt-4 flex justify-center">
          <Link href="/sports">
            <Button variant="secondary">
              {t("sportsCta")}
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <SectionHeader title={t("promoTitle")} icon={Gift} href="/promotions" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(promotions ?? []).slice(0, 3).map((p) => (
            <BonusCard key={p.slug} promotion={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
