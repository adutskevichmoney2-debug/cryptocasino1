"use client";

import { cn } from "@/lib/cn";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  className,
  size = "md",
}: {
  options: SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex w-fit items-center gap-1 rounded-lg bg-surface-2 p-1",
        className,
      )}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onValueChange(opt.value)}
          className={cn(
            "cursor-pointer whitespace-nowrap rounded-md font-medium transition-colors duration-120",
            size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-[13px]",
            value === opt.value
              ? "bg-surface-4 text-content shadow-card"
              : "text-content-tertiary hover:text-content-secondary",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
