"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock, TrendingDown, TrendingUp } from "lucide-react";
import { useBetslipStore } from "@/stores/betslipStore";
import { useOddsStore } from "@/stores/oddsStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { formatOdds } from "@/lib/odds";
import { cn } from "@/lib/cn";
import type { Outcome } from "@/services/types";

const OUTCOME_KEYS = new Set([
  "draw",
  "over",
  "under",
  "yes",
  "no",
  "homeOrDraw",
  "homeOrAway",
  "drawOrAway",
  "homeHandicap",
  "awayHandicap",
  "home",
  "away",
  "score10",
  "score21",
  "score11",
  "score02",
]);

export function useOutcomeLabel() {
  const t = useTranslations("sports.outcomes");
  return (label: string): string => (OUTCOME_KEYS.has(label) ? t(label as never) : label);
}

export function OddsButton({
  outcome,
  eventId,
  marketId,
  eventLabel,
  marketKey,
  stacked = false,
  className,
}: {
  outcome: Outcome;
  eventId: string;
  marketId: string;
  eventLabel: string;
  marketKey: string;
  /** Vertical label-over-odds layout for market grids. */
  stacked?: boolean;
  className?: string;
}) {
  const resolveLabel = useOutcomeLabel();
  const oddsFormat = useSettingsStore((s) => s.oddsFormat);
  const toggle = useBetslipStore((s) => s.toggle);
  const selected = useBetslipStore((s) => s.selections.some((sel) => sel.outcomeId === outcome.id));
  const override = useOddsStore((s) => s.overrides[outcome.id]);

  const odds = override?.odds ?? outcome.odds;
  const prevOdds = useRef(odds);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (prevOdds.current === odds) return;
    setFlash(odds > prevOdds.current ? "up" : "down");
    prevOdds.current = odds;
    const timer = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(timer);
  }, [odds]);

  const label = resolveLabel(outcome.label);

  if (outcome.locked) {
    return (
      <span
        className={cn(
          "flex h-10 items-center justify-center rounded-lg bg-surface-2 text-content-disabled",
          className,
        )}
      >
        <Lock className="size-3.5" />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        toggle({
          eventId,
          marketId,
          outcomeId: outcome.id,
          eventLabel,
          marketKey,
          outcomeLabel: label,
          odds,
        })
      }
      className={cn(
        "flex cursor-pointer items-center justify-between gap-1.5 rounded-lg px-2.5 transition-colors duration-120",
        stacked ? "h-12 flex-col justify-center gap-0.5 py-1.5" : "h-10",
        selected
          ? "bg-accent text-accent-content"
          : "bg-surface-2 hover:bg-surface-3",
        flash === "up" && !selected && "bg-success-soft",
        flash === "down" && !selected && "bg-danger-soft",
        className,
      )}
    >
      <span
        className={cn(
          "truncate text-xs font-medium",
          selected ? "text-accent-content/80" : "text-content-tertiary",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "flex items-center gap-1 text-[13px] font-bold tabular-nums",
          selected ? "text-accent-content" : "text-content",
          flash === "up" && !selected && "text-success",
          flash === "down" && !selected && "text-danger",
        )}
      >
        {flash === "up" && <TrendingUp className="size-3" />}
        {flash === "down" && <TrendingDown className="size-3" />}
        {formatOdds(odds, oddsFormat)}
      </span>
    </button>
  );
}
