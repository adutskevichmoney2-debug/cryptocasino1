"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only after the component mounted on the client.
 * Gate any UI that depends on localStorage-backed state behind this
 * (render a skeleton until mounted) to avoid hydration mismatches.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
