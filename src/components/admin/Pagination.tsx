import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { hrefWith, PAGE_SIZE } from "./query";

/**
 * Prev/next pager. Rendered on the server so the list screens stay server
 * components — navigation is plain locale-aware links.
 */
export function Pagination({
  basePath,
  params,
  page,
  total,
  pageSize = PAGE_SIZE,
  shown,
}: {
  basePath: string;
  params: Record<string, string | number | undefined>;
  page: number;
  total: number | null;
  pageSize?: number;
  /** Rows on the current page — used when an exact count is unavailable. */
  shown: number;
}) {
  const t = useTranslations("admin.common");
  const count = total ?? 0;
  const lastPage = total === null ? page + (shown === pageSize ? 1 : 0) : Math.max(1, Math.ceil(count / pageSize));
  const first = shown === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = (page - 1) * pageSize + shown;

  const linkClass =
    "inline-flex h-8 items-center gap-1 rounded-lg border border-line-strong bg-surface-3 px-3 text-[13px] font-semibold text-content transition-colors duration-120 hover:bg-surface-4";
  const disabledClass = "pointer-events-none opacity-40";

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-content-tertiary">
        {total === null
          ? t("showing", { from: first, to: last })
          : t("showingOf", { from: first, to: last, total: count.toLocaleString("en-US") })}
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={hrefWith(basePath, { ...params, page: page - 1 })}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(linkClass, page <= 1 && disabledClass)}
        >
          <ChevronLeft className="size-4" />
          {t("prev")}
        </Link>
        <span className="text-xs tabular-nums text-content-tertiary">
          {total === null ? t("page", { page }) : t("pageOf", { page, total: lastPage })}
        </span>
        <Link
          href={hrefWith(basePath, { ...params, page: page + 1 })}
          aria-disabled={page >= lastPage}
          tabIndex={page >= lastPage ? -1 : undefined}
          className={cn(linkClass, page >= lastPage && disabledClass)}
        >
          {t("next")}
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
