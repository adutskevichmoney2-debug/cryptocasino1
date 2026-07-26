import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export function SectionHeader({
  title,
  icon: Icon,
  href,
  count,
  className,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  count?: number;
  className?: string;
}) {
  const t = useTranslations("common");

  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="flex items-center gap-2 font-display text-base font-bold text-content sm:text-lg">
        {Icon && <Icon className="size-[18px] text-accent" />}
        {title}
        {count !== undefined && (
          <span className="text-sm font-semibold text-content-disabled">{count}</span>
        )}
      </h2>
      {href && (
        <Link
          href={href}
          className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-content-tertiary transition-colors duration-120 hover:text-content"
        >
          {t("viewAll")}
          <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
