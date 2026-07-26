"use client";

import { useLocale, useTranslations } from "next-intl";
import { Check, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { cn } from "@/lib/cn";

const LABELS: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
};

const SHORT: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
};

function useSwitchLocale() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    // Read the query at click time rather than via useSearchParams — this
    // component lives in the root layout, where that hook would opt every
    // page out of static rendering.
    const query = window.location.search;
    // usePathname() excludes the locale prefix, so the current route
    // (dynamic segments included) is preserved across the switch
    router.replace(`${pathname}${query}`, { locale: next });
  };

  return { locale, switchTo };
}

export function LanguageSwitcher({
  className,
  align = "left",
  compact = false,
}: {
  className?: string;
  align?: "left" | "right";
  /** Icon + short code trigger, for tight spots like the header. */
  compact?: boolean;
}) {
  const { locale, switchTo } = useSwitchLocale();
  const t = useTranslations("common");

  return (
    <Dropdown
      className={className}
      align={align}
      width="w-44"
      trigger={() => (
        <button
          type="button"
          aria-label={t("language")}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-lg text-[13px] font-medium text-content-secondary transition-colors duration-120 hover:bg-surface-3 hover:text-content",
            compact ? "h-9 px-2.5 font-semibold" : "px-2.5 py-1.5",
          )}
        >
          <Globe className="size-4" />
          {compact ? SHORT[locale] : LABELS[locale]}
        </button>
      )}
    >
      {routing.locales.map((l) => (
        <DropdownItem key={l} active={l === locale} onSelect={() => switchTo(l)}>
          <span className="flex-1">{LABELS[l]}</span>
          {l === locale && <Check className="size-4 text-accent" />}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}

/** Inline pill buttons — no dropdown. Used inside the mobile menu drawer. */
export function LanguageInline({ className }: { className?: string }) {
  const { locale, switchTo } = useSwitchLocale();
  const t = useTranslations("common");

  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <span className="flex items-center gap-2 text-sm font-semibold text-content-secondary">
        <Globe className="size-[18px]" />
        {t("language")}
      </span>
      <div className="flex gap-1 rounded-lg bg-surface-2 p-1">
        {routing.locales.map((l) => (
          <button
            key={l}
            type="button"
            aria-pressed={l === locale}
            onClick={() => switchTo(l)}
            className={cn(
              "cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-bold transition-colors duration-120",
              l === locale
                ? "bg-accent text-accent-content"
                : "text-content-tertiary hover:text-content",
            )}
          >
            {SHORT[l]}
          </button>
        ))}
      </div>
    </div>
  );
}
