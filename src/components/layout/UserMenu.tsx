"use client";

import { useTranslations } from "next-intl";
import {
  ArrowLeftRight,
  ChevronDown,
  LogOut,
  Settings,
  Ticket,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown";
import { Avatar } from "@/components/ui/Avatar";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

export function UserMenu() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const tPages = useTranslations("pages");
  const user = useAuthStore((s) => s.user);
  const openModal = useUiStore((s) => s.openModal);
  const router = useRouter();

  if (!user) return null;

  return (
    <Dropdown
      align="right"
      width="w-56"
      trigger={(open) => (
        <button
          type="button"
          aria-expanded={open}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg p-1 transition-colors duration-120 hover:bg-surface-3"
        >
          <Avatar nickname={user.nickname} avatarId={user.avatarId} size="sm" />
          <ChevronDown className="size-3.5 text-content-tertiary max-sm:hidden" />
        </button>
      )}
    >
      <div className="px-2.5 py-2">
        <p className="truncate text-[13px] font-bold text-content">{user.nickname}</p>
        <p className="truncate text-xs text-content-tertiary">{user.email}</p>
      </div>
      <DropdownSeparator />
      <DropdownItem onSelect={() => router.push("/profile")}>
        <User />
        {t("profile")}
      </DropdownItem>
      <DropdownItem onSelect={() => router.push("/profile/transactions")}>
        <ArrowLeftRight />
        {tPages("transactionsTitle")}
      </DropdownItem>
      <DropdownItem onSelect={() => router.push("/profile/bets")}>
        <Ticket />
        {tPages("betsTitle")}
      </DropdownItem>
      <DropdownItem onSelect={() => router.push("/profile/referrals")}>
        <Users />
        {tPages("referralsTitle")}
      </DropdownItem>
      <DropdownItem onSelect={() => router.push("/profile/settings")}>
        <Settings />
        {tPages("settingsTitle")}
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem danger onSelect={() => openModal("logout")}>
        <LogOut />
        {tAuth("logout")}
      </DropdownItem>
    </Dropdown>
  );
}
