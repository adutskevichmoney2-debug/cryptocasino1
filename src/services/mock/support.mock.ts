import type { ChatMessage, HelpArticle, Result, SupportService } from "../types";
import { ok } from "../types";
import { BOT_FALLBACK, BOT_GREETING, BOT_REPLIES, HELP_ARTICLES } from "./fixtures/help";
import { currentUserId } from "./auth.mock";
import { dbKeys, dbRead, dbWrite, makeId } from "./db";
import { delay } from "./latency";

type SupportedLocale = "en" | "ru";

const asLocale = (locale: string): SupportedLocale => (locale === "ru" ? "ru" : "en");

/** Ranks by title hit first, then excerpt, then body. */
function scoreArticle(article: HelpArticle, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (article.title.toLowerCase().includes(q)) score += 10;
  if (article.excerpt.toLowerCase().includes(q)) score += 4;
  if (article.body.some((p) => p.toLowerCase().includes(q))) score += 1;
  return score;
}

export function createSupportService(): SupportService {
  const chatKey = () => {
    const uid = currentUserId();
    return uid ? dbKeys.chat(uid) : "cc:db:chat:guest";
  };

  const botReply = (locale: SupportedLocale, text: string): string => {
    const lower = text.toLowerCase();
    const match = BOT_REPLIES[locale].find((r) => r.keywords.some((k) => lower.includes(k)));
    return match?.reply ?? BOT_FALLBACK[locale];
  };

  return {
    async getArticles(locale) {
      await delay(150, 350);
      return HELP_ARTICLES[asLocale(locale)];
    },

    async getArticleBySlug(locale, slug) {
      await delay(120, 300);
      return HELP_ARTICLES[asLocale(locale)].find((a) => a.slug === slug) ?? null;
    },

    async searchArticles(locale, query) {
      await delay(120, 300);
      const trimmed = query.trim();
      const articles = HELP_ARTICLES[asLocale(locale)];
      if (!trimmed) return articles;
      return articles
        .map((a) => ({ a, score: scoreArticle(a, trimmed) }))
        .filter((r) => r.score > 0)
        .sort((x, y) => y.score - x.score)
        .map((r) => r.a);
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

      // Typing pause before the canned answer, as a real chat widget would show
      await delay(800, 1500);
      const reply: ChatMessage = {
        id: makeId("msg"),
        from: "bot",
        text: botReply(asLocale(locale), text),
        createdAt: new Date().toISOString(),
      };
      dbWrite(key, [...dbRead<ChatMessage[]>(key, []), reply]);
      return reply;
    },

    async submitContactForm(): Promise<Result<void>> {
      await delay(600, 1100);
      return ok(undefined);
    },
  };
}

export { BOT_GREETING };
