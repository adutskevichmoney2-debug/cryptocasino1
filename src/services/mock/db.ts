/**
 * Tiny localStorage-backed "database" standing in for Supabase tables.
 * SSR-safe: every read returns the fallback when `window` is unavailable.
 * Only files inside src/services/mock may import this.
 */

const PREFIX = "cc:db:";

export const dbKeys = {
  users: `${PREFIX}users`,
  session: `${PREFIX}session`,
  wallet: (uid: string) => `${PREFIX}wallet:${uid}`,
  transactions: (uid: string) => `${PREFIX}tx:${uid}`,
  bets: (uid: string) => `${PREFIX}bets:${uid}`,
  favorites: (uid: string) => `${PREFIX}favs:${uid}`,
  recent: (uid: string) => `${PREFIX}recent:${uid}`,
  bonuses: (uid: string) => `${PREFIX}bonuses:${uid}`,
  chat: (uid: string) => `${PREFIX}chat:${uid}`,
  notifications: (uid: string) => `${PREFIX}notifications:${uid}`,
} as const;

export function dbRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function dbWrite<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota exceeded or storage disabled — the demo degrades to in-memory only
  }
}

export function dbRemove(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/** Random-looking but collision-safe id. Not used during render. */
export function makeId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}
