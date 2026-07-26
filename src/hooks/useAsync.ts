"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
}

/**
 * Runs an async function on mount (and when deps change), with a loading flag
 * for skeletons. Ignores results of stale invocations.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: React.DependencyList = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const runId = useRef(0);

  const run = useCallback(async () => {
    const id = ++runId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      if (id === runId.current) setState({ data, loading: false, error: null });
    } catch (error) {
      if (id === runId.current) setState((s) => ({ ...s, loading: false, error }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  return { ...state, reload: run };
}
