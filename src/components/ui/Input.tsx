"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftSlot, rightSlot, id, ...props }, ref) => {
    const autoId = useId();
    const inputId = id ?? autoId;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-content-secondary">
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex h-10 items-center gap-2 rounded-md border bg-surface-2 px-3 transition-colors duration-120",
            "focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft",
            error ? "border-danger" : "border-line-strong hover:border-graphite-500",
          )}
        >
          {leftSlot && <span className="shrink-0 text-content-tertiary [&_svg]:size-4">{leftSlot}</span>}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "h-full w-full min-w-0 bg-transparent text-sm text-content outline-none placeholder:text-content-disabled",
              className,
            )}
            {...props}
          />
          {rightSlot && <span className="shrink-0 text-content-tertiary [&_svg]:size-4">{rightSlot}</span>}
        </div>
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-content-tertiary">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
