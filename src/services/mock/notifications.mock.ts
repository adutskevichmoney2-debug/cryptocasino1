import type { AppNotification, NotificationsService } from "../types";
import { currentUserId } from "./auth.mock";
import { dbKeys, dbRead, dbWrite, makeId } from "./db";
import { Emitter } from "./latency";

const MAX_STORED = 30;

export function createNotificationsService(): NotificationsService {
  const emitter = new Emitter<AppNotification>();

  const read = (uid: string) => dbRead<AppNotification[]>(dbKeys.notifications(uid), []);
  const write = (uid: string, items: AppNotification[]) =>
    dbWrite(dbKeys.notifications(uid), items.slice(0, MAX_STORED));

  return {
    async getAll() {
      const uid = currentUserId();
      return uid ? read(uid) : [];
    },

    async push({ key, values, href }) {
      const notification: AppNotification = {
        id: makeId("ntf"),
        key,
        values,
        href,
        createdAt: new Date().toISOString(),
        read: false,
      };
      const uid = currentUserId();
      if (uid) write(uid, [notification, ...read(uid)]);
      emitter.emit(notification);
      return notification;
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
      return emitter.subscribe(cb);
    },
  };
}
