"use client";

import { createPortal } from "react-dom";
import { AnimatePresence, m } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { useUiStore, type ToastType } from "@/stores/uiStore";
import { useMounted } from "@/hooks/useMounted";
import { fadeUp, transitionUi } from "@/lib/motion";
import { cn } from "@/lib/cn";

const ICONS: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const COLORS: Record<ToastType, string> = {
  success: "text-success",
  error: "text-danger",
  info: "text-accent",
  warning: "text-warning",
};

export function ToastHub() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);
  const mounted = useMounted();

  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[110] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2 max-lg:bottom-[calc(72px+env(safe-area-inset-bottom))]"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <m.div
              key={t.id}
              layout
              variants={fadeUp}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={transitionUi}
              className="pointer-events-auto flex items-start gap-3 rounded-lg border border-line bg-surface-3 p-3 shadow-dropdown"
            >
              <Icon className={cn("mt-0.5 size-[18px] shrink-0", COLORS[t.type])} />
              <p className="min-w-0 flex-1 text-[13px] leading-snug text-content">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="shrink-0 cursor-pointer text-content-tertiary transition-colors duration-120 hover:text-content"
              >
                <X className="size-4" />
              </button>
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
