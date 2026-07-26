/**
 * Formatting helpers for the operator panel. English-only by design — the admin
 * UI is staff-facing and deliberately skips next-intl.
 *
 * All timestamps render in UTC so the same row reads identically for every
 * operator (and so server HTML matches client hydration).
 */
import { formatCrypto } from "@/lib/format";
import { RATES } from "@/services/mock/fixtures/coins";
import type { DbCoin } from "@/lib/supabase/types";

const DATE_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const DATE_ONLY = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "2-digit",
});

const TIME_ONLY = new Intl.DateTimeFormat("en-GB", {
  timeZone: "UTC",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export const DASH = "—";

export function fmtDateTime(value?: string | null): string {
  if (!value) return DASH;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? DASH : DATE_TIME.format(d);
}

export function fmtDate(value?: string | null): string {
  if (!value) return DASH;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? DASH : DATE_ONLY.format(d);
}

export function fmtTime(value?: string | null): string {
  if (!value) return DASH;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? DASH : TIME_ONLY.format(d);
}

/** Numeric columns arrive from PostgREST as strings — never format them raw. */
export function num(value: string | number | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function fmtAmount(value: string | number | null | undefined, decimals = 8): string {
  return formatCrypto(num(value), decimals);
}

/** Indicative USDT value of a coin amount, using the shared rate table. */
export function usdtValue(coin: DbCoin, amount: string | number | null | undefined): number {
  return num(amount) * (RATES[coin] ?? 0);
}

export function fmtUsdt(value: number): string {
  return formatCrypto(value, 2);
}

/** "3m ago" / "2d ago" — compact enough for a table cell. */
export function fmtAgo(value?: string | null): string {
  if (!value) return DASH;
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return DASH;
  const seconds = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(value);
}

/** 8f3c1a2b-… -> 8f3c1a2b */
export function shortId(id: string): string {
  return id.split("-")[0] ?? id;
}

/** Human label for an enum-ish value: self_excluded -> Self excluded */
export function humanize(value: string): string {
  const s = value.replace(/[_.]/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
