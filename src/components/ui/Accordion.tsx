"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("overflow-hidden rounded-xl border border-line bg-surface-1", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors duration-120 hover:bg-surface-2"
      >
        <span className="text-sm font-semibold text-content">{title}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-content-tertiary transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 text-[13px] leading-relaxed text-content-secondary">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
