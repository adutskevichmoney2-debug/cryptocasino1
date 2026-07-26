/**
 * Help center content and the canned support answers. Articles are editorial
 * fixtures in every backend; only the chat transcript differs (localStorage in
 * the mock, `support_tickets` + `support_messages` in Supabase).
 */

import type { HelpArticle } from "../types";
import { BOT_FALLBACK, BOT_REPLIES, HELP_ARTICLES } from "../mock/fixtures/help";

export type SupportedLocale = "en" | "ru";

export const asLocale = (locale: string): SupportedLocale => (locale === "ru" ? "ru" : "en");

export function listArticles(locale: string): HelpArticle[] {
  return HELP_ARTICLES[asLocale(locale)];
}

export function findArticle(locale: string, slug: string): HelpArticle | null {
  return HELP_ARTICLES[asLocale(locale)].find((a) => a.slug === slug) ?? null;
}

/** Ranks by title hit first, then excerpt, then body. */
function scoreArticle(article: HelpArticle, query: string): number {
  const q = query.toLowerCase();
  let score = 0;
  if (article.title.toLowerCase().includes(q)) score += 10;
  if (article.excerpt.toLowerCase().includes(q)) score += 4;
  if (article.body.some((p) => p.toLowerCase().includes(q))) score += 1;
  return score;
}

export function searchArticles(locale: string, query: string): HelpArticle[] {
  const trimmed = query.trim();
  const articles = HELP_ARTICLES[asLocale(locale)];
  if (!trimmed) return articles;
  return articles
    .map((a) => ({ a, score: scoreArticle(a, trimmed) }))
    .filter((r) => r.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((r) => r.a);
}

/** Keyword-matched canned answer, falling back to a generic one. */
export function botReply(locale: string, text: string): string {
  const key = asLocale(locale);
  const lower = text.toLowerCase();
  const match = BOT_REPLIES[key].find((r) => r.keywords.some((k) => lower.includes(k)));
  return match?.reply ?? BOT_FALLBACK[key];
}
