"use client";

import { useTranslations } from "next-intl";
import {
  ArrowLeftRight,
  LayoutDashboard,
  LifeBuoy,
  ScrollText,
  Ticket,
  Users,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type NavKey = "dashboard" | "players" | "transactions" | "support" | "bets" | "audit";

interface NavItem {
  href: string;
  key: NavKey;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  adminOnly?: boolean;
}

const ITEMS: NavItem[] = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/players", key: "players", icon: Users },
  { href: "/admin/transactions", key: "transactions", icon: ArrowLeftRight },
  { href: "/admin/support", key: "support", icon: LifeBuoy },
  { href: "/admin/bets", key: "bets", icon: Ticket },
  { href: "/admin/audit", key: "audit", icon: ScrollText, adminOnly: true },
];

export function AdminNav({
  isAdmin,
  orientation = "vertical",
}: {
  isAdmin: boolean;
  orientation?: "vertical" | "horizontal";
}) {
  const t = useTranslations("admin.nav");
  const pathname = usePathname();
  const items = ITEMS.filter((item) => !item.adminOnly || isAdmin);
  const horizontal = orientation === "horizontal";

  return (
    <nav
      aria-label={t("sections")}
      className={cn(
        horizontal
          ? "no-scrollbar flex items-center gap-1 overflow-x-auto px-3 py-2"
          : "flex flex-col gap-1 p-3",
      )}
    >
      {items.map(({ href, key, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors duration-120",
              horizontal && "shrink-0",
              active
                ? "bg-accent-soft text-accent"
                : "text-content-secondary hover:bg-surface-3 hover:text-content",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
