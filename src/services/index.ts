import type { Services } from "./types";
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
 * The single entry point for all data access. Swapping the mock layer for a
 * real backend happens here and nowhere else:
 *
 *   process.env.NEXT_PUBLIC_DATA_BACKEND === "supabase"
 *     ? createSupabaseServices()
 *     : createMockServices()
 *
 * See ./README.md for the full contract.
 */
export const services: Services = createMockServices();
