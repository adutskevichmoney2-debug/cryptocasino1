"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { fade, transitionUi } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <m.span
            role="tooltip"
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionUi}
            className={cn(
              "pointer-events-none absolute z-[60] w-max max-w-[240px] rounded-md border border-line bg-graphite-700 px-2.5 py-1.5 text-xs font-medium text-content shadow-dropdown",
              side === "top" && "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2",
              side === "bottom" && "left-1/2 top-[calc(100%+6px)] -translate-x-1/2",
              side === "right" && "left-[calc(100%+8px)] top-1/2 -translate-y-1/2",
            )}
          >
            {content}
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}
