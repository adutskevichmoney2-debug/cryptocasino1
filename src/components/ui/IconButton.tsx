"use client";

import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const iconButtonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-lg transition-colors duration-120 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        ghost: "text-content-secondary hover:bg-surface-3 hover:text-content",
        soft: "bg-surface-3 text-content-secondary hover:bg-surface-4 hover:text-content",
        outline:
          "border border-line-strong bg-transparent text-content-secondary hover:bg-surface-3 hover:text-content",
      },
      size: {
        sm: "size-8 [&_svg]:size-4",
        md: "size-9 [&_svg]:size-[18px]",
        lg: "size-10 [&_svg]:size-5",
      },
    },
    defaultVariants: { variant: "ghost", size: "md" },
  },
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Accessible label — required, icon-only buttons are invisible to screen readers otherwise. */
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, label, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      aria-label={label}
      title={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
IconButton.displayName = "IconButton";
