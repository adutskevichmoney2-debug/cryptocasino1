"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { SportIcon } from "./SportIcon";
import type { SportEventDetail } from "@/services/types";

export function EventHeader({ event }: { event: SportEventDetail }) {
  const t = useTranslations("sports");
  const format = useFormatter();

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-gradient-to-br from-surface-2 to-surface-1 p-5 shadow-card sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-content-tertiary">
          <SportIcon sport={event.sport} className="size-4" />
          {event.league}
        </p>
        {event.isLive ? (
          <Badge variant="live">
            {t("live")}
            {event.minute !== undefined && ` · ${t("minute", { minute: event.minute })}`}
          </Badge>
        ) : (
          <p className="text-[13px] font-semibold tabular-nums text-content-secondary">
            {format.dateTime(new Date(event.startsAt), { dateStyle: "medium", timeStyle: "short" })}
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <p className="text-right font-display text-lg font-extrabold leading-tight text-content sm:text-xl">
          {event.home}
        </p>
        {event.score ? (
          <p className="font-display text-3xl font-extrabold tabular-nums text-accent sm:text-4xl">
            {event.score.home}
            <span className="mx-1.5 text-content-disabled">:</span>
            {event.score.away}
          </p>
        ) : (
          <p className="font-display text-2xl font-extrabold text-content-disabled">VS</p>
        )}
        <p className="text-left font-display text-lg font-extrabold leading-tight text-content sm:text-xl">
          {event.away}
        </p>
      </div>
    </div>
  );
}
