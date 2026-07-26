"use client";

import { useTranslations } from "next-intl";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useUiStore } from "@/stores/uiStore";
import { useMounted } from "@/hooks/useMounted";
import { SIDEBAR_SECTIONS } from "./navConfig";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/cn";

export function Sidebar() {
  const t = useTranslations("nav");
  const tHeader = useTranslations("header");
  const pathname = usePathname();
  const mounted = useMounted();
  const collapsedState = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);
  // Before hydration always render the expanded layout the server produced
  const collapsed = mounted && collapsedState;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <aside
      className={cn(
        "fixed bottom-0 left-0 top-16 z-30 hidden shrink-0 flex-col border-r border-line bg-surface-1 transition-[width] duration-200 lg:flex",
        collapsed ? "w-[68px]" : "w-60",
      )}
    >
      <nav className="no-scrollbar flex-1 overflow-y-auto px-2.5 py-4">
        {SIDEBAR_SECTIONS.map((section, i) => (
          <div key={i} className={cn(i > 0 && "mt-5")}>
            {section.titleKey && !collapsed && (
              <p className="px-2.5 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-content-disabled">
                {t(section.titleKey)}
              </p>
            )}
            {section.titleKey && collapsed && <div className="mx-2 mb-2 h-px bg-line" />}
            <ul className="flex flex-col gap-0.5">
              {section.links.map((link) => {
                const active = isActive(link.href);
                const item = (
                  <Link
                    href={link.href}
                    className={cn(
                      "flex h-9 items-center gap-3 rounded-lg text-[13px] font-semibold transition-colors duration-120",
                      collapsed ? "justify-center px-0" : "px-2.5",
                      active
                        ? "bg-accent-soft text-accent"
                        : "text-content-secondary hover:bg-surface-3 hover:text-content",
                    )}
                  >
                    <link.icon className="size-[18px] shrink-0" />
                    {!collapsed && <span className="truncate">{t(link.key)}</span>}
                  </Link>
                );
                return (
                  <li key={link.href}>
                    {collapsed ? (
                      <Tooltip content={t(link.key)} side="right" className="w-full">
                        {item}
                      </Tooltip>
                    ) : (
                      item
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-2.5">
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? tHeader("expandSidebar") : tHeader("collapseSidebar")}
          className={cn(
            "flex h-9 w-full cursor-pointer items-center gap-3 rounded-lg text-[13px] font-semibold text-content-tertiary transition-colors duration-120 hover:bg-surface-3 hover:text-content",
            collapsed ? "justify-center" : "px-2.5",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[18px]" />
          ) : (
            <>
              <PanelLeftClose className="size-[18px]" />
              <span>{tHeader("collapseSidebar")}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
