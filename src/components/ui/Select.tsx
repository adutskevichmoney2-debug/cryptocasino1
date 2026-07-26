"use client";

import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

/** Styled native select — keyboard/mobile friendly out of the box. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const autoId = useId();
    const selectId = id ?? autoId;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-[13px] font-medium text-content-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            className={cn(
              "h-10 w-full cursor-pointer appearance-none rounded-md border bg-surface-2 pl-3 pr-9 text-sm text-content outline-none transition-colors duration-120",
              "focus:border-accent focus:ring-2 focus:ring-accent-soft",
              error ? "border-danger" : "border-line-strong hover:border-graphite-500",
              className,
            )}
            {...props}
          >
            {options.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled} className="bg-surface-2">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-content-tertiary" />
        </div>
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";
