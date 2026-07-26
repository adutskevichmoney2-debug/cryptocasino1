import type { Services } from "./types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createSupabaseServices } from "./supabase";
import { createAuthService } from "./mock/auth.mock";
import { createWalletService } from "./mock/wallet.mock";
import { createGamesService } from "./mock/games.mock";
import { createSportsService } from "./mock/sports.mock";
import { createBonusService } from "./mock/bonus.mock";
import { createSupportService } from "./mock/support.mock";
import { createNotificationsService } from "./mock/notifications.mock";

function createMockServices(): Services {
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

/**
 * The single entry point for all data access. The backend is chosen once, at
 * module load, from the environment: with Supabase credentials present the app
 * talks to the real database, without them it runs entirely on the mock layer
 * so the demo works with no setup at all.
 *
 * See ./README.md for the full contract.
 */
export const services: Services = isSupabaseConfigured
  ? createSupabaseServices()
  : createMockServices();
