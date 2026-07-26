"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchInput } from "@/components/ui/SearchInput";
import { Dropdown } from "@/components/ui/Dropdown";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { GameGrid, GameGridSkeleton } from "./GameGrid";
import { CASINO_CATEGORIES } from "@/lib/constants";
import { Link } from "@/i18n/navigation";
import type { Game } from "@/services/types";

const PAGE_SIZE = 24;

export function CategoryView({ category }: { category: string }) {
  const t = useTranslations("casino");
  const tCommon = useTranslations("common");
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 250);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [sort, setSort] = useState<"popular" | "new" | "az">("popular");
  const [pages, setPages] = useState(1);
  const [accumulated, setAccumulated] = useState<Game[]>([]);

  const { data: providers } = useAsync(() => services.games.getProviders(), []);

  const queryKey = `${category}|${debounced}|${selectedProviders.join(",")}|${sort}`;
  const { data, loading } = useAsync(async () => {
    const results: Game[] = [];
    let total = 0;
    for (let page = 1; page <= pages; page++) {
      const res = await services.games.getGames({
        category,
        search: debounced || undefined,
        providers: selectedProviders.length ? selectedProviders : undefined,
        sort,
        page,
        pageSize: PAGE_SIZE,
      });
      results.push(...res.items);
      total = res.total;
      if (res.items.length < PAGE_SIZE) break;
    }
    setAccumulated(results);
    return { items: results, total };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, pages]);

  const resetPaging = () => setPages(1);

  const toggleProvider = (id: string) => {
    resetPaging();
    setSelectedProviders((current) =>
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id],
    );
  };

  const games = data?.items ?? accumulated;
  const total = data?.total ?? 0;
  const hasMore = games.length < total;

  const categoryTabs = useMemo(() => CASINO_CATEGORIES.filter(Boolean), []);

  return (
    <div className="flex flex-col gap-5">
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {categoryTabs.map((c) => (
          <Link key={c} href={`/casino/category/${c}`}>
            <Chip active={c === category}>{t(`categories.${c}`)}</Chip>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onValueChange={(v) => {
            resetPaging();
            setSearch(v);
          }}
          placeholder={t("searchPlaceholder")}
          className="w-full max-w-sm"
        />

        <Dropdown
          align="left"
          width="w-64"
          trigger={(open) => (
            <button
              type="button"
              aria-expanded={open}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-line-strong bg-surface-2 px-3 text-[13px] font-semibold text-content-secondary transition-colors duration-120 hover:border-graphite-500 hover:text-content"
            >
              <SlidersHorizontal className="size-4" />
              {t("providers")}
              {selectedProviders.length > 0 && (
                <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-content">
                  {selectedProviders.length}
                </span>
              )}
              <ChevronDown className="size-3.5" />
            </button>
          )}
        >
          <div className="max-h-72 overflow-y-auto px-2 py-1.5">
            {(providers ?? []).map((p) => (
              <label
                key={p.id}
                className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1.5 py-1.5 hover:bg-surface-3"
              >
                <Checkbox
                  checked={selectedProviders.includes(p.id)}
                  onChange={() => toggleProvider(p.id)}
                  label={p.name}
                />
                <span className="text-xs tabular-nums text-content-disabled">{p.gameCount}</span>
              </label>
            ))}
          </div>
        </Dropdown>

        <div className="ml-auto w-40">
          <Select
            aria-label={t("sort")}
            value={sort}
            onChange={(e) => {
              resetPaging();
              setSort(e.target.value as typeof sort);
            }}
            options={[
              { value: "popular", label: t("sortPopular") },
              { value: "new", label: t("sortNew") },
              { value: "az", label: t("sortAz") },
            ]}
          />
        </div>
      </div>

      {!loading && (
        <p className="text-[13px] text-content-tertiary">{t("gamesCount", { count: total })}</p>
      )}

      {loading && games.length === 0 ? <GameGridSkeleton count={18} /> : <GameGrid games={games} />}

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="secondary" loading={loading} onClick={() => setPages((p) => p + 1)}>
            {tCommon("showMore")}
          </Button>
        </div>
      )}
    </div>
  );
}
