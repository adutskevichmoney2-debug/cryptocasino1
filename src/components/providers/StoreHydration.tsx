"use client";

import { useEffect } from "react";
import { useUiStore } from "@/stores/uiStore";

/**
 * All persisted zustand stores use skipHydration to avoid SSR/client HTML
 * mismatches. This component rehydrates them once on the client after mount.
 */
export function StoreHydration() {
  useEffect(() => {
    void useUiStore.persist.rehydrate();
  }, []);
  return null;
}
