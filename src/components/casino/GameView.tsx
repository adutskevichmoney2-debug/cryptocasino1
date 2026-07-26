"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart, Maximize } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useAuthStore } from "@/stores/authStore";
import { useCasinoStore } from "@/stores/casinoStore";
import { useUiStore } from "@/stores/uiStore";
import { GameFrame } from "./GameFrame";
import { GameRow } from "./GameRow";
import { NotFoundContent } from "@/components/shared/NotFoundContent";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconButton } from "@/components/ui/IconButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

export function GameView({ slug }: { slug: string }) {
  const t = useTranslations("casino");
  const searchParams = useSearchParams();
  const status = useAuthStore((s) => s.status);
  const favorites = useCasinoStore((s) => s.favorites);
  const toggleFavorite = useCasinoStore((s) => s.toggleFavorite);
  const openModal = useUiStore((s) => s.openModal);
  const frameWrapper = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"real" | "demo">(
    searchParams.get("mode") === "real" ? "real" : "demo",
  );

  const { data: game, loading } = useAsync(() => services.games.getGameBySlug(slug), [slug]);

  const { data: related } = useAsync(async () => {
    if (!game) return null;
    const result = await services.games.getGames({
      category: game.categories[0],
      pageSize: 13,
    });
    return result.items.filter((g) => g.id !== game.id).slice(0, 12);
  }, [game?.id]);

  useEffect(() => {
    if (game && status === "authed") void services.games.trackGameOpen(game.id);
  }, [game, status]);

  const handleMode = (next: "real" | "demo") => {
    if (next === "real" && status !== "authed") {
      openModal("login");
      return;
    }
    setMode(next);
  };

  const handleFullscreen = () => {
    void frameWrapper.current?.requestFullscreen?.();
  };

  const handleFavorite = () => {
    if (!game) return;
    if (status !== "authed") {
      openModal("login");
      return;
    }
    void toggleFavorite(game.id);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!game) return <NotFoundContent />;

  const isFavorite = favorites.includes(game.id);
  const volatilityLabel = {
    low: t("volatilityLow"),
    medium: t("volatilityMedium"),
    high: t("volatilityHigh"),
  }[game.volatility];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-content">{game.title}</h1>
          <p className="mt-0.5 text-[13px] text-content-tertiary">{game.providerName}</p>
        </div>
        <div className="flex items-center gap-2">
          <SegmentedControl
            size="sm"
            value={mode}
            onValueChange={handleMode}
            options={[
              { value: "demo", label: t("demoMode") },
              { value: "real", label: t("realMode") },
            ]}
          />
          <IconButton
            label={isFavorite ? t("removeFavorite") : t("addFavorite")}
            variant="soft"
            onClick={handleFavorite}
            className={cn(isFavorite && "text-danger")}
          >
            <Heart className={cn(isFavorite && "fill-current")} />
          </IconButton>
          <IconButton label={t("fullscreen")} variant="soft" onClick={handleFullscreen}>
            <Maximize />
          </IconButton>
        </div>
      </div>

      <div ref={frameWrapper} className="[&:fullscreen]:flex [&:fullscreen]:items-center [&:fullscreen]:bg-black">
        <GameFrame game={game} mode={mode} />
      </div>

      <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-xl border border-line bg-surface-1 px-5 py-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-content-disabled">
            {t("rtp")}
          </p>
          <p className="mt-0.5 text-sm font-bold tabular-nums text-content">{game.rtp}%</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-content-disabled">
            {t("volatility")}
          </p>
          <p className="mt-0.5 text-sm font-bold text-content">{volatilityLabel}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-content-disabled">
            {t("provider")}
          </p>
          <p className="mt-0.5 text-sm font-bold text-content">{game.providerName}</p>
        </div>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {game.categories
            .filter((c) => !["new", "popular"].includes(c))
            .map((c) => (
              <Badge key={c} variant="neutral">
                {t(`categories.${c}` as never)}
              </Badge>
            ))}
        </div>
      </div>

      {related && related.length > 0 && (
        <section>
          <SectionHeader title={t("relatedGames")} />
          <GameRow games={related} />
        </section>
      )}
    </div>
  );
}
