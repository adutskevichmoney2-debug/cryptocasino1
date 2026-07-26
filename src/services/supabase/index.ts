import type { Services } from "../types";
import { createAuthService } from "./auth.supabase";
import { createWalletService } from "./wallet.supabase";
import { createGamesService } from "./games.supabase";
import { createSportsService } from "./sports.supabase";
import { createBonusService } from "./bonus.supabase";
import { createSupportService } from "./support.supabase";
import { createNotificationsService } from "./notifications.supabase";

/**
 * Supabase-backed implementation of the service contract. Selected by
 * ../index.ts when NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are present.
 *
 * Static catalogue data (games, providers, sports events, promotions, help
 * articles, USD rates) still comes from ../shared and the fixtures it reads —
 * none of it is user data, and none of it has a table in supabase/migrations.
 */
export function createSupabaseServices(): Services {
  return {
    auth: createAuthService(),
    wallet: createWalletService(),
    games: createGamesService(),
    sports: createSportsService(),
    bonus: createBonusService(),
    support: createSupportService(),
    notifications: createNotificationsService(),
  };
}
