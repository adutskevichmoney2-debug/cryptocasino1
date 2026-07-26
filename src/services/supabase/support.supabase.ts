import type { ChatMessage, Result, SupportService } from "../types";
import { fail, ok } from "../types";
import { botReply, findArticle, listArticles, searchArticles } from "../shared/help";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { SupportMessageRow } from "@/lib/supabase/types";
import { currentUserId } from "./auth.supabase";
import { errorCode, failFrom } from "./errors";
import { subscribeAsync } from "./realtime";

/** Subject of the ticket the chat widget writes into. */
const CHAT_SUBJECT = "Live chat";

/**
 * ChatMessage only distinguishes the player from "the other side", so every
 * staff reply maps to "bot" — that is the side the UI renders on the left.
 */
function toChatMessage(row: SupportMessageRow): ChatMessage {
  return {
    id: row.id,
    from: row.is_staff ? "bot" : "user",
    text: row.body,
    createdAt: row.created_at,
  };
}

export function createSupportService(): SupportService {
  const supabase = getSupabaseBrowserClient();

  /** The ticket the chat widget reads and writes; null when none is open yet. */
  const findOpenTicket = async (uid: string): Promise<string | null> => {
    const { data } = await supabase
      .from("support_tickets")
      .select("id")
      .eq("user_id", uid)
      .in("status", ["open", "pending"])
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data?.id ?? null;
  };

  const openOrCreateTicket = async (uid: string): Promise<string | null> => {
    const existing = await findOpenTicket(uid);
    if (existing) return existing;
    const { data } = await supabase
      .from("support_tickets")
      .insert({ user_id: uid, subject: CHAT_SUBJECT })
      .select("id")
      .single();
    return data?.id ?? null;
  };

  return {
    // Help center content is editorial fixture data — see ../shared/help.
    async getArticles(locale) {
      return listArticles(locale);
    },

    async getArticleBySlug(locale, slug) {
      return findArticle(locale, slug);
    },

    async searchArticles(locale, query) {
      return searchArticles(locale, query);
    },

    async getChatHistory() {
      const uid = await currentUserId();
      if (!uid) return [];
      const ticketId = await findOpenTicket(uid);
      if (!ticketId) return [];

      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", ticketId)
        .order("created_at", { ascending: true });
      return (data ?? []).map(toChatMessage);
    },

    /**
     * The player's message is persisted on a real ticket for staff to answer;
     * the reply returned here is the canned first-line answer, which has no
     * server-side counterpart yet and is therefore not stored. Real staff
     * replies arrive through getChatHistory and onChatMessage.
     */
    async sendChatMessage(locale, text) {
      const uid = await currentUserId();
      if (uid) {
        const ticketId = await openOrCreateTicket(uid);
        if (ticketId) {
          await supabase
            .from("support_messages")
            .insert({ ticket_id: ticketId, sender_id: uid, is_staff: false, body: text });
        }
      }
      return {
        id: `bot-${Date.now().toString(36)}`,
        from: "bot",
        text: botReply(locale, text),
        createdAt: new Date().toISOString(),
      };
    },

    onChatMessage(cb) {
      return subscribeAsync(async () => {
        const uid = await currentUserId();
        if (!uid) return null;
        const ticketId = await findOpenTicket(uid);
        if (!ticketId) return null;
        return supabase
          .channel(`support:${ticketId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "support_messages",
              filter: `ticket_id=eq.${ticketId}`,
            },
            (payload) => {
              const row = payload.new as Partial<SupportMessageRow>;
              if (row.id) cb(toChatMessage(row as SupportMessageRow));
            },
          )
          .subscribe();
      });
    },

    async submitContactForm({ email, topic, message }): Promise<Result<void>> {
      const uid = await currentUserId();
      // support_tickets.user_id is NOT NULL and pinned to auth.uid() by RLS, so
      // an anonymous contact form would need a server route with the service key.
      if (!uid) return fail("auth/not-authenticated");

      try {
        const { data, error } = await supabase
          .from("support_tickets")
          .insert({ user_id: uid, subject: topic, topic })
          .select("id")
          .single();
        if (error || !data) return fail(errorCode(error));

        const { error: messageError } = await supabase.from("support_messages").insert({
          ticket_id: data.id,
          sender_id: uid,
          is_staff: false,
          // The form's reply-to address may differ from the account email.
          body: `${message}\n\n— ${email}`,
        });
        if (messageError) return fail(errorCode(messageError));
        return ok(undefined);
      } catch (error) {
        return failFrom(error);
      }
    },
  };
}
