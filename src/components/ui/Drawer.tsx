"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { X } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";
import { useBodyLock } from "@/hooks/useBodyLock";
import { fade, slideUp, slideRight, transitionStructural } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { IconButton } from "./IconButton";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "bottom" | "right";
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Drawer({ open, onClose, side = "bottom", title, children, className }: DrawerProps) {
  const mounted = useMounted();
  useBodyLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <m.div
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionStructural}
            className="absolute inset-0 bg-black/65"
            onClick={onClose}
            aria-hidden="true"
          />
          <m.div
            role="dialog"
            aria-modal="true"
            variants={side === "bottom" ? slideUp : slideRight}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionStructural}
            className={cn(
              "absolute flex flex-col border-line bg-surface-1 shadow-modal",
              side === "bottom"
                ? "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl border-t pb-[env(safe-area-inset-bottom)]"
                : "bottom-0 right-0 top-0 w-[min(400px,92vw)] border-l",
              className,
            )}
          >
            {side === "bottom" && (
              <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-graphite-600" aria-hidden="true" />
            )}
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h2 className="font-display text-base font-bold text-content">{title}</h2>
              <IconButton label="Close" size="sm" onClick={onClose}>
                <X />
              </IconButton>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
