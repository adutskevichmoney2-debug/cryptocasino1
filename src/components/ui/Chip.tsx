"use client";

import { cn } from "@/lib/cn";

/** Filter chip / pill button with an active state. */
export function Chip({
  active,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-120 [&_svg]:size-4",
        active
          ? "bg-accent text-accent-content"
          : "bg-surface-2 text-content-secondary hover:bg-surface-3 hover:text-content",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
