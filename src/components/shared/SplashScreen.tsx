"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const VISIBLE_MS = 1400;
const FADE_MS = 500;

/**
 * Branded loading screen shown on the initial page load: the gem mark spins
 * in 3D while the app hydrates, then the overlay fades away. Rendered on the
 * server too, so the very first paint is the splash rather than a flash of
 * unstyled content.
 */
export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "closing" | "gone">("visible");

  useEffect(() => {
    const hide = setTimeout(() => setPhase("closing"), VISIBLE_MS);
    const remove = setTimeout(() => setPhase("gone"), VISIBLE_MS + FADE_MS);
    return () => {
      clearTimeout(hide);
      clearTimeout(remove);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface-0 transition-opacity duration-500",
        phase === "closing" && "opacity-0",
      )}
    >
      <div className="[perspective:900px]">
        <div className="animate-gem-spin [transform-style:preserve-3d] motion-reduce:animate-none">
          <LogoMark className="size-24 drop-shadow-[0_0_32px_rgb(16_185_129/0.45)]" />
        </div>
      </div>

      <p className="mt-6 animate-splash-fade font-display text-2xl font-extrabold tracking-tight">
        <span className="text-content">Crypto</span>
        <span className="bg-gradient-to-r from-[#4ae5ab] to-[#0d9f74] bg-clip-text text-transparent">
          Casino
        </span>
      </p>

      <div className="mt-7 h-0.5 w-40 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full w-1/3 animate-splash-bar rounded-full bg-accent" />
      </div>
    </div>
  );
}
