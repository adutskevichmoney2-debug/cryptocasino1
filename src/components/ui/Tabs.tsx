"use client";

import { m } from "framer-motion";
import { useId } from "react";
import { cn } from "@/lib/cn";

export interface TabOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

/** Underline-style tabs with an animated indicator. */
export function Tabs<T extends string>({
  options,
  value,
  onValueChange,
  className,
  grow = false,
}: {
  options: TabOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  grow?: boolean;
}) {
  const layoutId = useId();

  return (
    <div role="tablist" className={cn("flex border-b border-line", className)}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              "relative cursor-pointer px-4 pb-2.5 pt-2 text-sm font-semibold transition-colors duration-120",
              grow && "flex-1",
              active ? "text-content" : "text-content-tertiary hover:text-content-secondary",
            )}
          >
            {opt.label}
            {active && (
              <m.span
                layoutId={layoutId}
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
