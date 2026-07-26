"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";

/**
 * Codes raised by the admin RPCs via `raise exception '<code>'`. Each one has a
 * matching `admin.common.errors.<code>` message in both locales.
 */
const CODES = [
  "player_id_taken",
  "player_id_invalid",
  "insufficient_funds",
  "invalid_amount",
  "cannot_target_self",
  "already_settled",
  "not_authenticated",
  "not_found",
  "forbidden",
] as const;

export type AdminErrorCode = (typeof CODES)[number];

/** Raw message carried by a PostgrestError / Error / string. */
export function rawErrorText(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "";
}

/** The first known exception code contained in the error, if any. */
export function errorCode(error: unknown): AdminErrorCode | null {
  const raw = rawErrorText(error);
  if (!raw) return null;
  return CODES.find((code) => raw.includes(code)) ?? null;
}

/**
 * Maps a failed RPC to operator-readable text in the active locale, falling back
 * to the raw Postgres message when the code is not one we translate.
 */
export function useErrorText(): (error: unknown) => string {
  const t = useTranslations("admin.common");
  return useCallback(
    (error: unknown) => {
      const code = errorCode(error);
      if (code) return t(`errors.${code}`);
      return rawErrorText(error) || t("errors.fallback");
    },
    [t],
  );
}
