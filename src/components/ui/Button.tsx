"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-colors duration-120 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-content hover:bg-accent-hover active:bg-accent-pressed shadow-card hover:shadow-[0_4px_24px_rgb(16_185_129/0.35)]",
        secondary:
          "border border-line-strong bg-surface-3 text-content hover:bg-surface-4 active:bg-surface-2",
        ghost: "text-content-secondary hover:bg-surface-3 hover:text-content",
        soft: "bg-accent-soft text-accent hover:bg-accent/20 active:bg-accent/25",
        danger: "bg-danger text-white hover:bg-danger-hover active:bg-danger",
        "danger-soft": "bg-danger-soft text-danger hover:bg-danger/20",
      },
      size: {
        xs: "h-7 px-2.5 text-xs",
        sm: "h-8 px-3 text-[13px]",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-[15px]",
      },
      full: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, loading, disabled, children, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, size, full }), className)}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
