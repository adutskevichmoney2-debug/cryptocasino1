import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { DbCoin, ExchangeRateInsert } from "@/lib/supabase/types";
import { RATES } from "@/services/mock/fixtures/coins";

/**
 * Refreshes public.exchange_rates from CoinGecko's free price feed.
 *
 * This is the only writer of that table: it holds a select policy and no write
 * policy, so the service-role client here is what gets the rows in. The handler
 * is cached for five minutes, which keeps the upstream call well inside the free
 * tier no matter how many visitors load the site.
 *
 * It never fails loudly. Anything that goes wrong upstream falls through to the
 * rows already in the table, and a missing Supabase configuration falls through
 * to the fixture seed, so the wallet and the operator panel always get a number.
 */
export const revalidate = 300;

/** CoinGecko coin id -> the enum value used throughout the schema. */
const COIN_IDS: Record<string, DbCoin> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  tether: "USDT",
  "usd-coin": "USDC",
  tron: "TRX",
  solana: "SOL",
  litecoin: "LTC",
  dogecoin: "DOGE",
};

const ENDPOINT =
  "https://api.coingecko.com/api/v3/simple/price" +
  `?ids=${Object.keys(COIN_IDS).join(",")}&vs_currencies=usd`;

type RateMap = Partial<Record<DbCoin, number>>;

/**
 * Pulls usable prices out of an untyped body. A partial response is normal when
 * the feed is degraded, so every coin is validated on its own and anything that
 * is not a finite positive number is simply left out of the upsert.
 */
function parseRates(body: unknown): RateMap {
  const rates: RateMap = {};
  if (typeof body !== "object" || body === null) return rates;
  const record = body as Record<string, unknown>;

  for (const [id, coin] of Object.entries(COIN_IDS)) {
    const entry = record[id];
    if (typeof entry !== "object" || entry === null) continue;
    const usd = (entry as Record<string, unknown>).usd;
    if (typeof usd === "number" && Number.isFinite(usd) && usd > 0) rates[coin] = usd;
  }

  return rates;
}

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ rates: RATES, source: "fixture" });
  }

  const supabase = getSupabaseAdminClient();
  let fetched: RateMap = {};

  try {
    // The segment-level revalidate above caches the response; this caches the
    // upstream call itself, so a dynamic render cannot stampede CoinGecko.
    const response = await fetch(ENDPOINT, {
      headers: { accept: "application/json" },
      next: { revalidate },
    });
    if (!response.ok) throw new Error(`coingecko responded ${response.status}`);
    fetched = parseRates(await response.json());
    if (Object.keys(fetched).length === 0) throw new Error("coingecko returned no usable prices");
  } catch (error) {
    console.error("[api/rates] price feed unavailable, serving stored rates", error);
  }

  const rows: ExchangeRateInsert[] = Object.entries(fetched).map(([coin, usd_price]) => ({
    coin: coin as DbCoin,
    usd_price,
    updated_at: new Date().toISOString(),
  }));

  if (rows.length > 0) {
    const { error } = await supabase.from("exchange_rates").upsert(rows, { onConflict: "coin" });
    if (error) console.error("[api/rates] upsert failed", error.message);
  }

  // Read back rather than echoing the fetch: whatever the refresh managed to
  // write, this is exactly what the rest of the app will see.
  const { data } = await supabase.from("exchange_rates").select("coin, usd_price, updated_at");

  if (!data || data.length === 0) {
    return NextResponse.json({ rates: RATES, source: "fixture" });
  }

  const rates: RateMap = {};
  let updatedAt: string | null = null;
  for (const row of data) {
    const price = Number(row.usd_price);
    if (!Number.isFinite(price) || price <= 0) continue;
    rates[row.coin] = price;
    if (!updatedAt || row.updated_at > updatedAt) updatedAt = row.updated_at;
  }

  return NextResponse.json({
    rates,
    updatedAt,
    source: rows.length > 0 ? "coingecko" : "stored",
  });
}
