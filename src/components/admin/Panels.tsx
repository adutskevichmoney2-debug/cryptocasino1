import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/** Page title row used across the admin screens. */
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="font-display text-xl font-extrabold text-content sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 max-w-[640px] text-[13px] text-content-tertiary">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  href,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  tone?: "neutral" | "accent" | "warning" | "success" | "danger";
}) {
  const toneClass = {
    neutral: "text-content",
    accent: "text-accent",
    warning: "text-warning",
    success: "text-success",
    danger: "text-danger",
  }[tone];

  const body = (
    // min-w-0 + break-words: a six-figure money figure must wrap inside the tile
    // instead of widening its grid column and scrolling the page at 360px.
    <Card className="flex h-full min-w-0 flex-col gap-1 p-3.5">
      <div className="flex min-w-0 items-center gap-2">
        {Icon && <Icon className="size-3.5 shrink-0 text-content-tertiary" />}
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-content-tertiary">
          {label}
        </p>
      </div>
      <p
        className={cn(
          "break-words font-display text-xl font-extrabold tabular-nums sm:text-2xl",
          toneClass,
        )}
      >
        {value}
      </p>
      {hint && <p className="truncate text-[11px] text-content-tertiary">{hint}</p>}
    </Card>
  );

  if (!href) return body;
  return (
    <Link href={href} className="block min-w-0 transition-opacity duration-120 hover:opacity-85">
      {body}
    </Link>
  );
}

/** Card wrapper with a heading, used for the player detail sections. */
export function Section({
  title,
  description,
  action,
  id,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("min-w-0", className)}>
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-[15px] font-bold text-content">{title}</h2>
          {description && <p className="text-xs text-content-tertiary">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Label/value pair for the profile overview grid. */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-content-tertiary">
        {label}
      </p>
      <div className="mt-0.5 break-words text-[13px] text-content">{children}</div>
    </div>
  );
}

export function SupabaseNotConfigured() {
  const t = useTranslations("admin.common");
  return (
    <Card className="mx-auto mt-10 max-w-[560px] p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-warning-soft">
          <AlertTriangle className="size-5 text-warning" />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-base font-bold text-content">
            {t("notConfiguredTitle")}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-content-secondary">
            {t.rich("notConfiguredBody", {
              code: (chunks) => (
                <code className="rounded bg-surface-3 px-1 py-0.5 font-mono text-xs text-content">
                  {chunks}
                </code>
              ),
            })}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  );
}
