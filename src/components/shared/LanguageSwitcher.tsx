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

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");

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

  return (
    <Dropdown
      className={className}
      align="left"
      width="w-44"
      trigger={() => (
        <button
          type="button"
          aria-label={t("language")}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-content-secondary transition-colors duration-120 hover:bg-surface-3 hover:text-content"
        >
          <Globe className="size-4" />
          {LABELS[locale]}
        </button>
      )}
    >
      {routing.locales.map((l) => (
        <DropdownItem key={l} active={l === locale} onSelect={() => switchTo(l)}>
          <span className="flex-1">{LABELS[l]}</span>
          {l === locale && <Check className={cn("size-4 text-accent")} />}
        </DropdownItem>
      ))}
    </Dropdown>
  );
}
