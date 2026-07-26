"use client";

import { useTranslations } from "next-intl";
import {
  ArrowLeftRight,
  BadgeCheck,
  Settings,
  Shield,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import type { Messages } from "next-intl";

const LINKS: { href: string; key: keyof Messages["pages"]; icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/profile", key: "profileTitle", icon: User },
  { href: "/profile/settings", key: "settingsTitle", icon: Settings },
  { href: "/profile/security", key: "securityTitle", icon: Shield },
  { href: "/profile/verification", key: "verificationTitle", icon: BadgeCheck },
  { href: "/profile/transactions", key: "transactionsTitle", icon: ArrowLeftRight },
  { href: "/profile/bets", key: "betsTitle", icon: Ticket },
  { href: "/profile/referrals", key: "referralsTitle", icon: Users },
];

export function ProfileNav() {
  const t = useTranslations("pages");
  const pathname = usePathname();

  return (
    <nav className="no-scrollbar -mx-4 overflow-x-auto px-4 lg:mx-0 lg:px-0">
      <ul className="flex gap-1.5 lg:flex-col">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <li key={link.href} className="shrink-0">
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors duration-120",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-content-secondary hover:bg-surface-3 hover:text-content",
                )}
              >
                <link.icon className="size-4 shrink-0" />
                {t(link.key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
