"use client";

import { SearchX } from "lucide-react";
import { useTranslations } from "next-intl";
import { GameCard } from "./GameCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Game } from "@/services/types";

export function GameGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4] w-full rounded-xl" />
      ))}
    </div>
  );
}

export function GameGrid({
  games,
  loading,
  emptyTitle,
  emptyHint,
}: {
  games: Game[];
  loading?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const t = useTranslations("casino");

  if (loading) return <GameGridSkeleton />;

  if (games.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={emptyTitle ?? t("noGames")}
        description={emptyHint ?? t("noGamesHint")}
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
