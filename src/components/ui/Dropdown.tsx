"use client";

import { createContext, useContext, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { fadeUp, transitionUi } from "@/lib/motion";
import { cn } from "@/lib/cn";

const DropdownCtx = createContext<{ close: () => void }>({ close: () => {} });

export function Dropdown({
  trigger,
  children,
  align = "right",
  width = "w-56",
  className,
}: {
  /** Render prop: receives open state, returns the trigger element. */
  trigger: (open: boolean) => React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  width?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <div onClick={() => setOpen((o) => !o)}>{trigger(open)}</div>
      <AnimatePresence>
        {open && (
          <m.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionUi}
            className={cn(
              "absolute top-[calc(100%+6px)] z-50 overflow-hidden rounded-xl border border-line bg-surface-2 p-1.5 shadow-dropdown",
              align === "right" ? "right-0" : "left-0",
              width,
            )}
          >
            <DropdownCtx.Provider value={{ close: () => setOpen(false) }}>
              {children}
            </DropdownCtx.Provider>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({
  onSelect,
  children,
  danger,
  active,
  className,
}: {
  onSelect?: () => void;
  children: React.ReactNode;
  danger?: boolean;
  active?: boolean;
  className?: string;
}) {
  const { close } = useContext(DropdownCtx);
  return (
    <button
      type="button"
      onClick={() => {
        onSelect?.();
        close();
      }}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors duration-120 [&_svg]:size-4 [&_svg]:shrink-0",
        danger
          ? "text-danger hover:bg-danger-soft"
          : active
            ? "bg-surface-4 text-content"
            : "text-content-secondary hover:bg-surface-3 hover:text-content",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="mx-1 my-1.5 h-px bg-line" aria-hidden="true" />;
}
