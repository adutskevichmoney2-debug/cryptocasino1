"use client";

import { useTranslations } from "next-intl";
import { Dice5, Trophy, Wallet, Menu, User } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/cn";

export function MobileTabBar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const setMobileMenuOpen = useUiStore((s) => s.setMobileMenuOpen);
  const openModal = useUiStore((s) => s.openModal);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const itemClass = (active: boolean) =>
    cn(
      "flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold transition-colors duration-120 [&_svg]:size-[19px]",
      active ? "text-accent" : "text-content-tertiary",
    );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[60px] items-stretch border-t border-line bg-surface-1/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <button type="button" className={itemClass(false)} onClick={() => setMobileMenuOpen(true)}>
        <Menu />
        {t("menu")}
      </button>

      <Link href="/casino" className={itemClass(isActive("/casino"))}>
        <Dice5 />
        {t("casino")}
      </Link>

      <button
        type="button"
        onClick={() => openModal("wallet")}
        className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-2 text-[10px] font-semibold text-accent-content"
      >
        <span className="flex size-9 items-center justify-center rounded-full bg-accent shadow-raised">
          <Wallet className="size-[19px]" />
        </span>
      </button>

      <Link href="/sports" className={itemClass(isActive("/sports"))}>
        <Trophy />
        {t("sports")}
      </Link>

      <Link href="/profile" className={itemClass(isActive("/profile"))}>
        <User />
        {t("profile")}
      </Link>
    </nav>
  );
}
