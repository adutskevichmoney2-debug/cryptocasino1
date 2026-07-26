"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronRight, SearchX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import type { HelpArticle } from "@/services/types";

function ArticleLink({ article }: { article: HelpArticle }) {
  return (
    <Link
      href={`/help/article/${article.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-line bg-surface-1 p-4 transition-colors duration-120 hover:border-line-strong hover:bg-surface-2"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-content">{article.title}</p>
        <p className="mt-0.5 line-clamp-2 text-[13px] text-content-tertiary">{article.excerpt}</p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-content-disabled transition-transform duration-120 group-hover:translate-x-0.5" />
    </Link>
  );
}

export function HelpCenterView() {
  const t = useTranslations("help");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const debounced = useDebounce(search, 250);
  const searching = debounced.trim().length > 0;

  const { data: articles, loading } = useAsync(
    () =>
      searching
        ? services.support.searchArticles(locale, debounced)
        : services.support.getArticles(locale),
    [locale, debounced, searching],
  );

  const byCategory = useMemo(() => {
    const groups = new Map<string, HelpArticle[]>();
    for (const a of articles ?? []) {
      groups.set(a.category, [...(groups.get(a.category) ?? []), a]);
    }
    return [...groups.entries()];
  }, [articles]);

  return (
    <div className="flex flex-col gap-6">
      <SearchInput
        value={search}
        onValueChange={setSearch}
        placeholder={t("searchPlaceholder")}
        className="h-11 max-w-xl"
      />

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : searching ? (
        (articles ?? []).length === 0 ? (
          <EmptyState icon={SearchX} title={t("noResults")} description={t("noResultsHint")} />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {(articles ?? []).map((a) => (
              <ArticleLink key={a.slug} article={a} />
            ))}
          </div>
        )
      ) : (
        byCategory.map(([category, items]) => (
          <section key={category}>
            <h2 className="mb-3 font-display text-base font-bold text-content">
              {t(`categories.${category}` as never)}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((a) => (
                <ArticleLink key={a.slug} article={a} />
              ))}
            </div>
          </section>
        ))
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-1 p-5">
        <p className="text-sm font-semibold text-content">{t("contactCta")}</p>
        <Link href="/help/contact">
          <Button variant="soft">{t("contactButton")}</Button>
        </Link>
      </div>
    </div>
  );
}
