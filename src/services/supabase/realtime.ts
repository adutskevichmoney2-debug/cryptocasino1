/**
 * Realtime plumbing shared by the Supabase services.
 *
 * Every subscribe* method on the service interfaces is synchronous, but a
 * per-user channel filter needs the user id, which is async — and the stores
 * subscribe once at app start, usually before anyone has signed in. These
 * helpers open the channel when the id becomes known, rebind it across
 * sign-in/sign-out, and make the returned Unsubscribe safe to call at any point
 * in that dance.
 */

import type { RealtimeChannel } from "@supabase/supabase-js";
import type { Unsubscribe } from "../types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { currentUserId } from "./auth.supabase";

export function subscribeWithUser(open: (uid: string) => RealtimeChannel): Unsubscribe {
  const supabase = getSupabaseBrowserClient();
  let channel: RealtimeChannel | null = null;
  let boundTo: string | null = null;
  let cancelled = false;

  const close = () => {
    if (channel) {
      void supabase.removeChannel(channel);
      channel = null;
    }
    boundTo = null;
  };

  const bind = (uid: string | null) => {
    if (cancelled || uid === boundTo) return;
    close();
    if (!uid) return;
    boundTo = uid;
    channel = open(uid);
  };

  void currentUserId()
    .then(bind)
    .catch(() => {
      // A dropped subscription must never break the caller's render path.
    });

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    // The client holds an internal lock while this callback runs; defer.
    setTimeout(() => bind(session?.user.id ?? null), 0);
  });

  return () => {
    cancelled = true;
    data.subscription.unsubscribe();
    close();
  };
}

/** For channels whose filter depends on more than the user id. */
export function subscribeAsync(open: () => Promise<RealtimeChannel | null>): Unsubscribe {
  const supabase = getSupabaseBrowserClient();
  let channel: RealtimeChannel | null = null;
  let cancelled = false;

  void open()
    .then((opened) => {
      if (!opened) return;
      if (cancelled) {
        void supabase.removeChannel(opened);
        return;
      }
      channel = opened;
    })
    .catch(() => {
      // As above: subscription failures stay inside the service layer.
    });

  return () => {
    cancelled = true;
    if (channel) {
      void supabase.removeChannel(channel);
      channel = null;
    }
  };
}
