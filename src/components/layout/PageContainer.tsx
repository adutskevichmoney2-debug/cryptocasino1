import { cn } from "@/lib/cn";

export function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1284px] px-4 py-6 sm:px-6 sm:py-8", className)}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-content sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-[640px] text-sm text-content-tertiary">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
