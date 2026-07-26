"use client";

import { useTranslations } from "next-intl";
import { AccordionItem } from "@/components/ui/Accordion";
import { OddsButton } from "./OddsButton";
import type { Market, SportEventDetail } from "@/services/types";
import { cn } from "@/lib/cn";

export function MarketGroup({
  market,
  event,
  defaultOpen,
}: {
  market: Market;
  event: SportEventDetail;
  defaultOpen?: boolean;
}) {
  const t = useTranslations("sports.markets");
  const eventLabel = `${event.home} — ${event.away}`;

  let title: string;
  try {
    title = t(market.key as never);
  } catch {
    title = market.key;
  }

  return (
    <AccordionItem title={title} defaultOpen={defaultOpen}>
      <div
        className={cn(
          "grid gap-1.5",
          market.outcomes.length === 2 && "grid-cols-2",
          market.outcomes.length === 3 && "grid-cols-3",
          market.outcomes.length >= 4 && "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {market.outcomes.map((outcome) => (
          <OddsButton
            key={outcome.id}
            stacked
            outcome={outcome}
            eventId={event.id}
            marketId={market.id}
            eventLabel={eventLabel}
            marketKey={market.key}
          />
        ))}
      </div>
    </AccordionItem>
  );
}
