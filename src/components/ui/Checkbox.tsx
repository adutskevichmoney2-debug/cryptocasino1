"use client";

import { forwardRef, useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "children"> {
  label?: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className={cn("group flex cursor-pointer items-start gap-2.5", className)}
        >
          <span className="relative mt-0.5 inline-flex">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              aria-invalid={!!error}
              className="peer size-[18px] cursor-pointer appearance-none rounded border border-line-strong bg-surface-2 transition-colors duration-120 checked:border-accent checked:bg-accent group-hover:border-graphite-500 checked:group-hover:border-accent"
              {...props}
            />
            <Check
              className="pointer-events-none absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-accent-content opacity-0 transition-opacity duration-120 peer-checked:opacity-100"
              strokeWidth={3.5}
              aria-hidden="true"
            />
          </span>
          {label && <span className="text-[13px] leading-relaxed text-content-secondary">{label}</span>}
        </label>
        {error && (
          <p role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
