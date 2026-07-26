"use client";

import { useTranslations } from "next-intl";
import { Menu } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { BalancePill } from "@/components/wallet/BalancePill";
import { NotificationsDropdown } from "@/components/shared/NotificationsDropdown";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { UserMenu } from "./UserMenu";
import { useUiStore } from "@/stores/uiStore";
import { useAuthStore } from "@/stores/authStore";
import { useMounted } from "@/hooks/useMounted";

export function Header() {
  const t = useTranslations("auth");
  const tHeader = useTranslations("header");
  const tNav = useTranslations("nav");
  const setMobileMenuOpen = useUiStore((s) => s.setMobileMenuOpen);
  const openModal = useUiStore((s) => s.openModal);
  const status = useAuthStore((s) => s.status);
  const mounted = useMounted();

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-[13px] font-semibold text-content-secondary transition-colors duration-120 hover:bg-surface-3 hover:text-content"
    >
      {label}
    </Link>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-line bg-surface-1/95 px-3 backdrop-blur-md sm:px-4">
      <IconButton
        label={tHeader("openMenu")}
        className="lg:hidden"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu />
      </IconButton>

      <Link href="/" aria-label="CryptoCasino" className="shrink-0">
        <Logo className="max-sm:[&>span:last-child]:hidden" />
      </Link>

      <nav className="ml-4 hidden items-center gap-1 lg:flex">
        {navLink("/casino", tNav("casino"))}
        {navLink("/sports", tNav("sports"))}
        {navLink("/promotions", tNav("promotions"))}
      </nav>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <LanguageSwitcher compact align="right" className="max-lg:hidden" />
        {!mounted || status === "loading" ? (
          <Skeleton className="h-9 w-44 max-sm:w-24" />
        ) : status === "authed" ? (
          <>
            <BalancePill />
            <NotificationsDropdown />
            <UserMenu />
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => openModal("login")}>
              {t("login")}
            </Button>
            <Button size="sm" onClick={() => openModal("register")}>
              {t("register")}
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
