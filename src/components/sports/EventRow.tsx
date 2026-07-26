"use client";

import { useFormatter, useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/Badge";
import { OddsButton } from "./OddsButton";
import type { SportEvent } from "@/services/types";

export function EventRow({ event }: { event: SportEvent }) {
  const t = useTranslations("sports");
  const format = useFormatter();
  const eventLabel = `${event.home} — ${event.away}`;

  return (
    <div className="flex flex-col gap-3 px-4 py-3 transition-colors duration-120 hover:bg-surface-2 sm:flex-row sm:items-center">
      <Link href={`/sports/event/${event.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="w-14 shrink-0 text-center">
          {event.isLive ? (
            <div className="flex flex-col items-center gap-1">
              <Badge variant="live">{t("live")}</Badge>
              {event.minute !== undefined && (
                <span className="text-[11px] font-semibold tabular-nums text-danger">
                  {t("minute", { minute: event.minute })}
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-[13px] font-semibold tabular-nums text-content-secondary">
                {format.dateTime(new Date(event.startsAt), { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="text-[11px] text-content-disabled">
                {format.dateTime(new Date(event.startsAt), { day: "numeric", month: "short" })}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-content">{event.home}</p>
          <p className="truncate text-[13px] font-semibold text-content">{event.away}</p>
          <p className="mt-0.5 truncate text-[11px] text-content-disabled">{event.league}</p>
        </div>

        {event.score && (
          <div className="shrink-0 text-right">
            <p className="text-[13px] font-bold tabular-nums text-accent">{event.score.home}</p>
            <p className="text-[13px] font-bold tabular-nums text-accent">{event.score.away}</p>
          </div>
        )}
      </Link>

      <div className="flex shrink-0 items-center gap-1.5">
        <div
          className="grid flex-1 gap-1.5 sm:w-[276px]"
          style={{ gridTemplateColumns: `repeat(${event.mainMarket.outcomes.length}, 1fr)` }}
        >
          {event.mainMarket.outcomes.map((outcome) => (
            <OddsButton
              key={outcome.id}
              outcome={{
                ...outcome,
                label:
                  outcome.label === event.home
                    ? "1"
                    : outcome.label === event.away
                      ? "2"
                      : outcome.label === "draw"
                        ? "X"
                        : outcome.label,
              }}
              eventId={event.id}
              marketId={event.mainMarket.id}
              eventLabel={eventLabel}
              marketKey={event.mainMarket.key}
            />
          ))}
        </div>
        <Link
          href={`/sports/event/${event.id}`}
          className="flex h-10 shrink-0 items-center gap-0.5 rounded-lg px-2 text-xs font-semibold text-content-tertiary transition-colors duration-120 hover:bg-surface-3 hover:text-content"
        >
          {t("marketsMore", { count: event.marketCount })}
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function EventList({ events }: { events: SportEvent[] }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface-1">
      {events.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </div>
  );
}
