import { cn } from "@/lib/cn";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-surface-2">
          <Icon className="size-5 text-content-tertiary" />
        </span>
      )}
      <p className="text-sm font-semibold text-content">{title}</p>
      {description && <p className="max-w-[320px] text-[13px] text-content-tertiary">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
