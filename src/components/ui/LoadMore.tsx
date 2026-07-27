"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

const loadMoreVariants = cva("flex flex-col items-center gap-2 text-center", {
  variants: {
    size: {
      sm: "text-[11px]",
      md: "text-xs",
    },
  },
  defaultVariants: { size: "md" },
});

export interface LoadMoreProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof loadMoreVariants> {
  /** Rows currently on screen. */
  loaded: number;
  /** Rows the server reports in total for the active filter. */
  total: number;
  /** A further page is in flight. */
  loading?: boolean;
  onLoadMore: () => void;
}

/**
 * Footer for an accumulating list: the visible range out of the total, plus a
 * "load more" button that disappears once everything is on screen.
 */
export const LoadMore = forwardRef<HTMLDivElement, LoadMoreProps>(
  ({ className, size, loaded, total, loading, onLoadMore, ...props }, ref) => {
    const t = useTranslations("common");
    if (total === 0) return null;

    return (
      <div ref={ref} className={cn(loadMoreVariants({ size }), className)} {...props}>
        <p className="tabular-nums text-content-tertiary">
          {t("showingOf", { from: loaded === 0 ? 0 : 1, to: loaded, total })}
        </p>
        {loaded < total && (
          <Button
            variant="secondary"
            size={size === "sm" ? "sm" : "md"}
            loading={loading}
            onClick={onLoadMore}
          >
            {t("loadMore")}
          </Button>
        )}
      </div>
    );
  },
);
LoadMore.displayName = "LoadMore";
