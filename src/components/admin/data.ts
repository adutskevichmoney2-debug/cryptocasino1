import "server-only";

import type { getSupabaseServerClient } from "@/lib/supabase/server";
import { RATES as FALLBACK_RATES } from "@/services/mock/fixtures/coins";
import type { RateMap } from "./format";

export type AdminSupabase = Awaited<ReturnType<typeof getSupabaseServerClient>>;

export interface MiniProfile {
  id: string;
  player_id: number;
  nickname: string;
  email: string;
}

/**
 * Resolves a batch of user ids to display names in one round trip.
 *
 * Embedded PostgREST joins are avoided on purpose: the hand-written Database
 * type declares no relationships, so `select("*, profiles(...)")` would not
 * type-check.
 */
export async function loadProfiles(
  supabase: AdminSupabase,
  ids: readonly (string | null | undefined)[],
): Promise<Map<string, MiniProfile>> {
  const unique = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (unique.length === 0) return new Map();

  const { data } = await supabase
    .from("profiles")
    .select("id, player_id, nickname, email")
    .in("id", unique);

  return new Map((data ?? []).map((p) => [p.id, p]));
}

/**
 * Current USD prices for the USDT-equivalent columns, read once per page.
 *
 * `exchange_rates` is public reference data refreshed by /api/rates, so the
 * anon-scoped page client can read it. Prices arrive as numeric strings. Coins
 * the table cannot supply fall back to the seed values, matching what the
 * player-facing wallet service does — a stale price is a smaller lie than
 * pricing every balance at zero.
 */
export async function loadRates(supabase: AdminSupabase): Promise<RateMap> {
  const { data } = await supabase.from("exchange_rates").select("coin, usd_price");

  const rates: RateMap = { ...FALLBACK_RATES };
  for (const row of data ?? []) {
    const price = Number(row.usd_price);
    if (Number.isFinite(price) && price > 0) rates[row.coin] = price;
  }
  return rates;
}
