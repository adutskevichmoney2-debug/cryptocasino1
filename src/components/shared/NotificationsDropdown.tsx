"use client";

import { Bell, BellOff } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Dropdown } from "@/components/ui/Dropdown";
import { IconButton } from "@/components/ui/IconButton";
import { useNotificationsStore } from "@/stores/notificationsStore";
import { cn } from "@/lib/cn";

export function NotificationsDropdown() {
  const t = useTranslations("notifications");
  const format = useFormatter();
  const items = useNotificationsStore((s) => s.items);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);

  return (
    <Dropdown
      align="right"
      width="w-80"
      trigger={() => (
        <span className="relative inline-flex">
          <IconButton label={t("title")} variant="ghost">
            <Bell />
          </IconButton>
          {unreadCount > 0 && (
            <span className="pointer-events-none absolute right-1.5 top-1.5 flex size-2">
              <span className="absolute size-full animate-live rounded-full bg-accent" />
              <span className="size-full rounded-full bg-accent" />
            </span>
          )}
        </span>
      )}
    >
      <div className="flex items-center justify-between px-2.5 py-2">
        <p className="text-[13px] font-bold text-content">{t("title")}</p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="cursor-pointer text-xs font-semibold text-accent hover:underline"
          >
            {t("markAllRead")}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <BellOff className="size-5 text-content-disabled" />
          <p className="text-[13px] text-content-tertiary">{t("empty")}</p>
        </div>
      ) : (
        <ul className="max-h-80 overflow-y-auto">
          {items.slice(0, 12).map((n) => (
            <li
              key={n.id}
              className={cn(
                "flex gap-2.5 rounded-lg px-2.5 py-2.5",
                !n.read && "bg-accent-soft/40",
              )}
            >
              <span
                className={cn(
                  "mt-1.5 size-1.5 shrink-0 rounded-full",
                  n.read ? "bg-graphite-500" : "bg-accent",
                )}
                aria-hidden="true"
              />
              <div className="min-w-0">
                <p className="text-[13px] leading-snug text-content">
                  {t(`items.${n.key}` as never, n.values as never)}
                </p>
                <p className="mt-0.5 text-[11px] text-content-tertiary">
                  {format.relativeTime(new Date(n.createdAt))}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Dropdown>
  );
}
