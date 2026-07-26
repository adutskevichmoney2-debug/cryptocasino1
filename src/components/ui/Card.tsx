import { cn } from "@/lib/cn";

export function Card({
  className,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-surface-1 shadow-card",
        interactive &&
          "transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-line-strong",
        className,
      )}
      {...props}
    />
  );
}
