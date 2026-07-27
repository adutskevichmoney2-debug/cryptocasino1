"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Paginated } from "@/services/types";

interface PaginatedListState<T> {
  /** Every row loaded so far — page 1 plus whatever "load more" appended. */
  items: T[];
  total: number;
  /** First load (or a reload after the filter changed) — render skeletons. */
  loading: boolean;
  /** A follow-up page is in flight — keep the list and disable the control. */
  loadingMore: boolean;
  loadMore: () => void;
}

/**
 * Accumulating pagination over a `Paginated<T>` service call. The fetcher gets
 * the page number; returning null (e.g. signed-out) yields an empty list.
 * Changing `deps` resets back to page 1.
 */
export function usePaginatedList<T>(
  fetchPage: (page: number) => Promise<Paginated<T> | null>,
  deps: React.DependencyList = [],
): PaginatedListState<T> {
  const [items, setItems] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  /** Bumped on every reset so results of a superseded filter are dropped. */
  const runId = useRef(0);
  const fetcher = useRef(fetchPage);

  const load = useCallback(async (nextPage: number, append: boolean) => {
    const id = append ? runId.current : ++runId.current;
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const result = await fetcher.current(nextPage);
      if (id !== runId.current) return;
      const rows = result?.items ?? [];
      setItems((prev) => (append ? [...prev, ...rows] : rows));
      setTotal(result?.total ?? 0);
      setPage(nextPage);
    } catch {
      if (id !== runId.current) return;
      if (!append) {
        setItems([]);
        setTotal(0);
      }
    } finally {
      // A reset that superseded this call owns the flags and clears them itself,
      // so the spinner can never be left spinning.
      if (id === runId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  const reset = useCallback(() => {
    fetcher.current = fetchPage;
    void load(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reset();
  }, [reset]);

  const loadMore = useCallback(() => {
    if (loading || loadingMore) return;
    void load(page + 1, true);
  }, [load, loading, loadingMore, page]);

  return { items, total, loading, loadingMore, loadMore };
}
