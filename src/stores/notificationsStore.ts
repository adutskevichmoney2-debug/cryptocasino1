import { create } from "zustand";
import { services } from "@/services";
import type { AppNotification } from "@/services/types";

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  markAllRead: () => Promise<void>;
}

let subscribed = false;

const countUnread = (items: AppNotification[]) => items.filter((n) => !n.read).length;

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
  items: [],
  unreadCount: 0,

  async init() {
    if (!subscribed) {
      subscribed = true;
      services.notifications.onNotification((n) =>
        set((s) => {
          const items = [n, ...s.items];
          return { items, unreadCount: countUnread(items) };
        }),
      );
    }
    await get().refresh();
  },

  async refresh() {
    const items = await services.notifications.getAll();
    set({ items, unreadCount: countUnread(items) });
  },

  async markAllRead() {
    await services.notifications.markAllRead();
    set((s) => ({ items: s.items.map((n) => ({ ...n, read: true })), unreadCount: 0 }));
  },
}));
