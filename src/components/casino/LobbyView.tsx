"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clapperboard, Radio, Sparkles, Spade, TrendingUp, Zap } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchInput } from "@/components/ui/SearchInput";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { GameRow } from "./GameRow";
import { GameGrid, GameGridSkeleton } from "./GameGrid";
import type { CasinoCategory } from "@/lib/constants";

const ROWS: { category: CasinoCategory; icon: React.ComponentType<{ className?: string }> }[] = [
  { category: "popular", icon: TrendingUp },
  { category: "new", icon: Sparkles },
  { category: "slots", icon: Sparkles },
  { category: "live", icon: Radio },
  { category: "game-shows", icon: Clapperboard },
  { category: "originals", icon: Zap },
  { category: "table", icon: Spade },
];

function CategoryRow({ category, icon }: (typeof ROWS)[number]) {
  const t = useTranslations("casino");
  const { data, loading } = useAsync(
    () => services.games.getGames({ category, pageSize: 14 }),
    [category],
  );

  return (
    <section>
      <SectionHeader
        title={t(`categories.${category}`)}
        icon={icon}
        href={`/casino/category/${category}`}
        count={data?.total}
      />
      <GameRow games={data?.items ?? []} loading={loading} />
    </section>
  );
}

export function LobbyView() {
  const t = useTranslations("casino");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 250);
  const searching = debounced.trim().length > 0;

  const { data: results, loading } = useAsync(
    async () => (searching ? services.games.getGames({ search: debounced, pageSize: 48 }) : null),
    [debounced, searching],
  );

  return (
    <div className="flex flex-col gap-7">
      <SearchInput
        value={search}
        onValueChange={setSearch}
        placeholder={t("searchPlaceholder")}
        className="h-11 max-w-xl"
      />

      {searching ? (
        <section>
          {results && !loading && (
            <p className="mb-3 text-[13px] text-content-tertiary">
              {t("gamesCount", { count: results.total })}
            </p>
          )}
          {loading ? (
            <GameGridSkeleton />
          ) : (
            <GameGrid games={results?.items ?? []} />
          )}
        </section>
      ) : (
        ROWS.map((row) => <CategoryRow key={row.category} {...row} />)
      )}
    </div>
  );
}
