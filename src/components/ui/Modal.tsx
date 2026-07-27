"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { useMounted } from "@/hooks/useMounted";
import { useBodyLock } from "@/hooks/useBodyLock";
import { fade, fadeScale, transitionStructural } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { IconButton } from "./IconButton";

const SIZES = {
  sm: "max-w-[400px]",
  md: "max-w-[480px]",
  lg: "max-w-[640px]",
  xl: "max-w-[840px]",
} as const;

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: keyof typeof SIZES;
  children: React.ReactNode;
  /** Extra content rendered in the header row, before the close button. */
  headerExtra?: React.ReactNode;
  noPadding?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  size = "md",
  children,
  headerExtra,
  noPadding,
}: ModalProps) {
  const t = useTranslations("common");
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  useBodyLock(open);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <m.div
            variants={fade}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionStructural}
            className="absolute inset-0 bg-black/65 backdrop-blur-[2px]"
            onClick={onClose}
            aria-hidden="true"
          />
          <m.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            variants={fadeScale}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionStructural}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-xl border border-line bg-surface-1 shadow-modal outline-none",
              SIZES[size],
            )}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-5 pb-1 pt-4">
              <h2 className="font-display text-base font-bold text-content">{title}</h2>
              <div className="flex items-center gap-1">
                {headerExtra}
                <IconButton label={t("close")} size="sm" onClick={onClose}>
                  <X />
                </IconButton>
              </div>
            </div>
            <div className={cn("min-h-0 flex-1 overflow-y-auto", noPadding ? "" : "px-5 pb-5 pt-3")}>
              {children}
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
