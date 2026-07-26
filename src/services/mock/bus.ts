import { Emitter } from "./latency";
import type { AppNotification, Balance, Transaction } from "../types";

/**
 * Module-level event buses shared by the mock services, so cross-domain
 * effects (a settled bet crediting the wallet) reach every subscriber no
 * matter which service triggered them. A real backend gets this for free
 * from realtime channels.
 */
export const balanceBus = new Emitter<Balance[]>();
export const txBus = new Emitter<Transaction>();
export const notificationBus = new Emitter<AppNotification>();
