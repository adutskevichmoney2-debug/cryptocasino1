"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CalendarX, Radio, Trophy } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useOddsSubscription } from "@/hooks/useOddsSubscription";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { EventList } from "./EventRow";
import { EventHeader } from "./EventHeader";
import { MarketGroup } from "./MarketGroup";
import { SportIcon } from "./SportIcon";
import { NotFoundContent } from "@/components/shared/NotFoundContent";
import type { SportEvent } from "@/services/types";

function EventListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-[74px] w-full rounded-xl" />
      ))}
    </div>
  );
}

function useEventIds(events: SportEvent[] | null | undefined): string[] {
  return useMemo(() => (events ?? []).map((e) => e.id), [events]);
}

export function SportsHomeView() {
  const t = useTranslations("sports");

  const { data: top, loading: loadingTop } = useAsync(
    () => services.sports.getEvents({ top: true }),
    [],
  );
  const { data: live, loading: loadingLive } = useAsync(
    () => services.sports.getEvents({ live: true, limit: 8 }),
    [],
  );

  useOddsSubscription(useEventIds([...(top ?? []), ...(live ?? [])]));

  return (
    <div className="flex flex-col gap-7">
      <section>
        <SectionHeader title={t("topEvents")} icon={Trophy} />
        {loadingTop ? <EventListSkeleton /> : <EventList events={top ?? []} />}
      </section>

      <section>
        <SectionHeader title={t("liveNow")} icon={Radio} href="/sports/live" />
        {loadingLive ? <EventListSkeleton rows={3} /> : <EventList events={live ?? []} />}
      </section>
    </div>
  );
}

export function LiveView() {
  const t = useTranslations("sports");
  const { data: events, loading } = useAsync(() => services.sports.getEvents({ live: true }), []);
  useOddsSubscription(useEventIds(events));

  const bySport = useMemo(() => {
    const groups = new Map<string, SportEvent[]>();
    for (const e of events ?? []) {
      groups.set(e.sport, [...(groups.get(e.sport) ?? []), e]);
    }
    return [...groups.entries()];
  }, [events]);

  if (loading) return <EventListSkeleton rows={8} />;
  if (!events || events.length === 0) {
    return <EmptyState icon={CalendarX} title={t("noBets")} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {bySport.map(([sport, sportEvents]) => (
        <section key={sport}>
          <SectionHeader
            title={t(`list.${sport}` as never)}
            icon={(props) => <SportIcon sport={sport} {...props} />}
            count={sportEvents.length}
          />
          <EventList events={sportEvents} />
        </section>
      ))}
    </div>
  );
}

export function SportView({ sport }: { sport: string }) {
  const t = useTranslations("sports");
  const { data: events, loading } = useAsync(() => services.sports.getEvents({ sport }), [sport]);
  useOddsSubscription(useEventIds(events));

  const byLeague = useMemo(() => {
    const groups = new Map<string, SportEvent[]>();
    for (const e of events ?? []) {
      groups.set(e.league, [...(groups.get(e.league) ?? []), e]);
    }
    return [...groups.entries()];
  }, [events]);

  if (loading) return <EventListSkeleton rows={6} />;
  if (!events || events.length === 0) {
    return <EmptyState icon={CalendarX} title={t("eventsCount", { count: 0 })} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {byLeague.map(([league, leagueEvents]) => (
        <section key={league}>
          <SectionHeader title={league} count={leagueEvents.length} />
          <EventList events={leagueEvents} />
        </section>
      ))}
    </div>
  );
}

export function EventDetailView({ eventId }: { eventId: string }) {
  const { data: event, loading } = useAsync(
    () => services.sports.getEventById(eventId),
    [eventId],
  );
  useOddsSubscription(useMemo(() => (event ? [event.id] : []), [event]));

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!event) return <NotFoundContent />;

  return (
    <div className="flex flex-col gap-4">
      <EventHeader event={event} />
      <div className="space-y-2.5">
        {event.markets.map((market, i) => (
          <MarketGroup key={market.id} market={market} event={event} defaultOpen={i < 3} />
        ))}
      </div>
    </div>
  );
}
