import type { ChatMessage, Result, SupportService } from "../types";
import { ok } from "../types";
import { botReply, findArticle, listArticles, searchArticles } from "../shared/help";
import { BOT_GREETING } from "./fixtures/help";
import { currentUserId } from "./auth.mock";
import { dbKeys, dbRead, dbWrite, makeId } from "./db";
import { delay, Emitter } from "./latency";

export function createSupportService(): SupportService {
  const emitter = new Emitter<ChatMessage>();

  const chatKey = () => {
    const uid = currentUserId();
    return uid ? dbKeys.chat(uid) : "cc:db:chat:guest";
  };

  return {
    async getArticles(locale) {
      await delay(150, 350);
      return listArticles(locale);
    },

    async getArticleBySlug(locale, slug) {
      await delay(120, 300);
      return findArticle(locale, slug);
    },

    async searchArticles(locale, query) {
      await delay(120, 300);
      return searchArticles(locale, query);
    },

    async getChatHistory() {
      return dbRead<ChatMessage[]>(chatKey(), []);
    },

    async sendChatMessage(locale, text) {
      const key = chatKey();
      const history = dbRead<ChatMessage[]>(key, []);
      const userMessage: ChatMessage = {
        id: makeId("msg"),
        from: "user",
        text,
        createdAt: new Date().toISOString(),
      };
      dbWrite(key, [...history, userMessage]);
      emitter.emit(userMessage);

      // Typing pause before the canned answer, as a real chat widget would show
      await delay(800, 1500);
      const reply: ChatMessage = {
        id: makeId("msg"),
        from: "bot",
        text: botReply(locale, text),
        createdAt: new Date().toISOString(),
      };
      dbWrite(key, [...dbRead<ChatMessage[]>(key, []), reply]);
      emitter.emit(reply);
      return reply;
    },

    onChatMessage(cb) {
      return emitter.subscribe(cb);
    },

    async submitContactForm(): Promise<Result<void>> {
      await delay(600, 1100);
      return ok(undefined);
    },
  };
}

export { BOT_GREETING };
