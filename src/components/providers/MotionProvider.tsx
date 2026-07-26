"use client";

import { LazyMotion, domAnimation, MotionConfig } from "framer-motion";
import { useSettingsStore } from "@/stores/settingsStore";

/**
 * Loads framer-motion features lazily (bundle size), respects the OS
 * prefers-reduced-motion setting and the in-app "reduce animations" toggle.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}>{children}</MotionConfig>
    </LazyMotion>
  );
}
