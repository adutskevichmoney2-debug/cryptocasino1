"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Drawer } from "@/components/ui/Drawer";
import { LanguageInline } from "@/components/shared/LanguageSwitcher";
import { useUiStore } from "@/stores/uiStore";
import { SIDEBAR_SECTIONS } from "./navConfig";
import { cn } from "@/lib/cn";

export function MobileMenuDrawer() {
  const t = useTranslations("nav");
  const open = useUiStore((s) => s.mobileMenuOpen);
  const setOpen = useUiStore((s) => s.setMobileMenuOpen);
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Drawer open={open} onClose={() => setOpen(false)} side="left" title={t("menu")}>
      <div className="flex flex-col gap-5">
        {SIDEBAR_SECTIONS.map((section, i) => (
          <div key={i}>
            {section.titleKey && (
              <p className="px-2.5 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-content-disabled">
                {t(section.titleKey)}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm font-semibold transition-colors duration-120",
                      isActive(link.href)
                        ? "bg-accent-soft text-accent"
                        : "text-content-secondary hover:bg-surface-3 hover:text-content",
                    )}
                  >
                    <link.icon className="size-[18px] shrink-0" />
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="border-t border-line px-2.5 pt-4">
          <LanguageInline />
        </div>
      </div>
    </Drawer>
  );
}
