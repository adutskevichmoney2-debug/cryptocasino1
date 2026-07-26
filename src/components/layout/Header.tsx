"use client";

import { useTranslations } from "next-intl";
import { Menu, Search } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { useUiStore } from "@/stores/uiStore";

export function Header() {
  const t = useTranslations("auth");
  const tHeader = useTranslations("header");
  const tNav = useTranslations("nav");
  const setMobileMenuOpen = useUiStore((s) => s.setMobileMenuOpen);
  const openModal = useUiStore((s) => s.openModal);

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
        <Link
          href="/casino"
          className="rounded-lg px-3 py-2 text-[13px] font-semibold text-content-secondary transition-colors duration-120 hover:bg-surface-3 hover:text-content"
        >
          {tNav("casino")}
        </Link>
        <Link
          href="/sports"
          className="rounded-lg px-3 py-2 text-[13px] font-semibold text-content-secondary transition-colors duration-120 hover:bg-surface-3 hover:text-content"
        >
          {tNav("sports")}
        </Link>
        <Link
          href="/promotions"
          className="rounded-lg px-3 py-2 text-[13px] font-semibold text-content-secondary transition-colors duration-120 hover:bg-surface-3 hover:text-content"
        >
          {tNav("promotions")}
        </Link>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/casino"
          aria-label={tNav("casino")}
          className="hidden size-9 items-center justify-center rounded-lg text-content-secondary transition-colors duration-120 hover:bg-surface-3 hover:text-content sm:inline-flex lg:hidden"
        >
          <Search className="size-[18px]" />
        </Link>

        <Button variant="ghost" size="sm" onClick={() => openModal("login")}>
          {t("login")}
        </Button>
        <Button size="sm" onClick={() => openModal("register")}>
          {t("register")}
        </Button>
      </div>
    </header>
  );
}
