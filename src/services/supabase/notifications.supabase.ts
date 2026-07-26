import type { AppNotification, NotificationsService } from "../types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/lib/supabase/types";
import { Emitter } from "../mock/latency";
import { currentUserId } from "./auth.supabase";
import { subscribeWithUser } from "./realtime";

const MAX_STORED = 30;

function toNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    key: row.key,
    values: row.values ?? undefined,
    createdAt: row.created_at,
    read: row.read,
    href: row.href ?? undefined,
  };
}

export function createNotificationsService(): NotificationsService {
  const supabase = getSupabaseBrowserClient();
  const local = new Emitter<AppNotification>();

  return {
    async getAll() {
      const uid = await currentUserId();
      if (!uid) return [];
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(MAX_STORED);
      return (data ?? []).map(toNotification);
    },

    /**
     * Client-side only. Rows are written by push_notification inside the money
     * RPCs — there is no insert policy on `notifications`, by design — so this
     * just broadcasts the optimistic entry the caller wants to show right now.
     */
    async push(input) {
      const notification: AppNotification = {
        id: `local-${Date.now().toString(36)}`,
        key: input.key,
        values: input.values,
        href: input.href,
        createdAt: new Date().toISOString(),
        read: false,
      };
      local.emit(notification);
      return notification;
    },

    async markRead(ids) {
      const uid = await currentUserId();
      if (!uid || ids.length === 0) return;
      await supabase.from("notifications").update({ read: true }).eq("user_id", uid).in("id", ids);
    },

    async markAllRead() {
      const uid = await currentUserId();
      if (!uid) return;
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", uid)
        .eq("read", false);
    },

    onNotification(cb) {
      const unsubscribeLocal = local.subscribe(cb);
      const unsubscribeRealtime = subscribeWithUser((uid) =>
        supabase
          .channel(`notifications:${uid}`)
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
            (payload) => {
              const row = payload.new as Partial<NotificationRow>;
              if (row.id) cb(toNotification(row as NotificationRow));
            },
          )
          .subscribe(),
      );
      return () => {
        unsubscribeLocal();
        unsubscribeRealtime();
      };
    },
  };
}
