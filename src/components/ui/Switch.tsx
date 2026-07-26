"use client";

import { cn } from "@/lib/cn";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
}: SwitchProps) {
  const toggle = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-[22px] w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-accent" : "bg-surface-4",
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] size-[18px] rounded-full bg-white shadow-sm transition-[left] duration-200",
          checked ? "left-[20px]" : "left-[2px]",
        )}
      />
    </button>
  );

  if (!label) return toggle;

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-content">{label}</p>
        {description && <p className="mt-0.5 text-xs text-content-tertiary">{description}</p>}
      </div>
      {toggle}
    </div>
  );
}
