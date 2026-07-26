import type { AppNotification, NotificationsService } from "../types";
import { currentUserId } from "./auth.mock";
import { dbKeys, dbRead, dbWrite, makeId } from "./db";
import { notificationBus } from "./bus";

const MAX_STORED = 30;

const read = (uid: string) => dbRead<AppNotification[]>(dbKeys.notifications(uid), []);
const write = (uid: string, items: AppNotification[]) =>
  dbWrite(dbKeys.notifications(uid), items.slice(0, MAX_STORED));

/** Creates + persists + broadcasts a notification. Usable by any mock service. */
export function pushSystemNotification(input: {
  key: string;
  values?: Record<string, string | number>;
  href?: string;
}): AppNotification {
  const notification: AppNotification = {
    id: makeId("ntf"),
    key: input.key,
    values: input.values,
    href: input.href,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const uid = currentUserId();
  if (uid) write(uid, [notification, ...read(uid)]);
  notificationBus.emit(notification);
  return notification;
}

export function createNotificationsService(): NotificationsService {
  return {
    async getAll() {
      const uid = currentUserId();
      return uid ? read(uid) : [];
    },

    async push(input) {
      return pushSystemNotification(input);
    },

    async markRead(ids) {
      const uid = currentUserId();
      if (!uid) return;
      const set = new Set(ids);
      write(
        uid,
        read(uid).map((n) => (set.has(n.id) ? { ...n, read: true } : n)),
      );
    },

    async markAllRead() {
      const uid = currentUserId();
      if (!uid) return;
      write(
        uid,
        read(uid).map((n) => ({ ...n, read: true })),
      );
    },

    onNotification(cb) {
      return notificationBus.subscribe(cb);
    },
  };
}
