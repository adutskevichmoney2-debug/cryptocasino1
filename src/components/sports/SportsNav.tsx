"use client";

import { useTranslations } from "next-intl";
import { Radio, Trophy } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { SportIcon } from "./SportIcon";
import { cn } from "@/lib/cn";

export function SportsNav() {
  const t = useTranslations("sports");
  const pathname = usePathname();
  const { data: sports } = useAsync(() => services.sports.getSports(), []);

  const liveTotal = (sports ?? []).reduce((acc, s) => acc + s.liveCount, 0);

  const pill = (href: string, active: boolean, content: React.ReactNode) => (
    <Link
      key={href}
      href={href}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors duration-120",
        active
          ? "bg-accent text-accent-content"
          : "bg-surface-2 text-content-secondary hover:bg-surface-3 hover:text-content",
      )}
    >
      {content}
    </Link>
  );

  return (
    <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {pill(
        "/sports",
        pathname === "/sports",
        <>
          <Trophy className="size-4" />
          {t("topEvents")}
        </>,
      )}
      {pill(
        "/sports/live",
        pathname === "/sports/live",
        <>
          <Radio className="size-4" />
          {t("live")}
          {liveTotal > 0 && (
            <span className="rounded-full bg-danger px-1.5 text-[11px] font-bold tabular-nums text-white">
              {liveTotal}
            </span>
          )}
        </>,
      )}
      {(sports ?? []).map((s) =>
        pill(
          `/sports/${s.slug}`,
          pathname === `/sports/${s.slug}`,
          <>
            <SportIcon sport={s.slug} className="size-4" />
            {t(`list.${s.slug}` as never)}
            {s.liveCount > 0 && (
              <span className="size-1.5 rounded-full bg-danger" aria-hidden="true" />
            )}
          </>,
        ),
      )}
    </nav>
  );
}
