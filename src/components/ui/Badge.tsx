import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
  {
    variants: {
      variant: {
        neutral: "bg-surface-3 text-content-secondary",
        accent: "bg-accent-soft text-accent",
        success: "bg-success-soft text-success",
        danger: "bg-danger-soft text-danger",
        warning: "bg-warning-soft text-warning",
        live: "bg-danger-soft text-danger",
        outline: "border border-line-strong text-content-tertiary",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "live" && (
        <span className="size-1.5 animate-live rounded-full bg-danger" aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
