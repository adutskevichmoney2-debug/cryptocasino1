"use client";

import { Heart, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { GameThumb } from "./GameThumb";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/stores/authStore";
import { useCasinoStore } from "@/stores/casinoStore";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/cn";
import type { Game } from "@/services/types";

export function GameCard({ game }: { game: Game }) {
  const t = useTranslations("casino");
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const favorites = useCasinoStore((s) => s.favorites);
  const toggleFavorite = useCasinoStore((s) => s.toggleFavorite);
  const openModal = useUiStore((s) => s.openModal);
  const pushToast = useUiStore((s) => s.pushToast);

  const isFavorite = favorites.includes(game.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authed") {
      openModal("login");
      return;
    }
    void toggleFavorite(game.id);
  };

  const handleReal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (status !== "authed") {
      pushToast("info", t("loginToPlay"));
      openModal("login");
      return;
    }
    router.push(`/casino/game/${game.slug}?mode=real`);
  };

  return (
    <Link
      href={`/casino/game/${game.slug}`}
      className="group relative block select-none transition-transform duration-200 hover:-translate-y-1"
    >
      <GameThumb slug={game.slug} title={game.title} providerName={game.providerName} />

      {game.isNew && (
        <Badge variant="accent" className="absolute left-2 top-2">
          {t("newBadge")}
        </Badge>
      )}

      <button
        type="button"
        onClick={handleFavorite}
        aria-label={isFavorite ? t("removeFavorite") : t("addFavorite")}
        className={cn(
          "absolute right-2 top-2 flex size-7 cursor-pointer items-center justify-center rounded-full bg-black/45 backdrop-blur-sm transition-all duration-120",
          isFavorite
            ? "text-danger opacity-100"
            : "text-white/80 opacity-0 hover:text-white group-hover:opacity-100 max-lg:opacity-100",
        )}
      >
        <Heart className={cn("size-3.5", isFavorite && "fill-current")} />
      </button>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 max-lg:hidden">
        <button
          type="button"
          onClick={handleReal}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-[13px] font-bold text-accent-content transition-colors duration-120 hover:bg-accent-hover"
        >
          <Play className="size-3.5 fill-current" />
          {t("playReal")}
        </button>
        <span className="text-xs font-semibold text-white/70 transition-colors duration-120 hover:text-white">
          {t("playDemo")}
        </span>
      </div>
    </Link>
  );
}
