"use client";

import { useEffect } from "react";
import { services } from "@/services";
import { useOddsStore } from "@/stores/oddsStore";
import { useBetslipStore } from "@/stores/betslipStore";

/** Live odds drift for the given events; feeds the odds and betslip stores. */
export function useOddsSubscription(eventIds: string[]) {
  const key = eventIds.join(",");

  useEffect(() => {
    if (!key) return;
    const ids = key.split(",");
    return services.sports.subscribeOdds(ids, (updates) => {
      useOddsStore.getState().apply(updates);
      useBetslipStore.getState().applyOddsUpdates(updates);
    });
  }, [key]);
}
