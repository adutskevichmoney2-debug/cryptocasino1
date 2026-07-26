"use client";

import { Heart, History } from "lucide-react";
import { useTranslations } from "next-intl";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useCasinoStore } from "@/stores/casinoStore";
import { GameGrid } from "./GameGrid";
import { AuthGuard } from "@/components/layout/AuthGuard";

export function FavoritesView() {
  const t = useTranslations("casino");
  const favorites = useCasinoStore((s) => s.favorites);

  const { data, loading } = useAsync(
    () => services.games.getGamesByIds(favorites),
    [favorites.join(",")],
  );

  return (
    <AuthGuard>
      <GameGrid
        games={data ?? []}
        loading={loading}
        emptyTitle={t("noFavorites")}
        emptyHint={t("noFavoritesHint")}
      />
    </AuthGuard>
  );
}

export function RecentView() {
  const t = useTranslations("casino");
  const { data, loading } = useAsync(() => services.games.getRecentlyPlayed(), []);

  return (
    <AuthGuard>
      <GameGrid
        games={data ?? []}
        loading={loading}
        emptyTitle={t("noRecent")}
        emptyHint={t("noRecentHint")}
      />
    </AuthGuard>
  );
}

export const FAVORITES_ICONS = { Heart, History };
