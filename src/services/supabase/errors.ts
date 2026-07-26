/**
 * Postgres / GoTrue errors mapped onto the stable `Result` codes the UI renders
 * through `t('errors.' + code)`. The RPCs in supabase/migrations raise bare
 * machine strings ('insufficient_funds', 'invalid_code', …) with errcode P0001,
 * which PostgREST surfaces verbatim as the error message.
 *
 * Anything unrecognised collapses to "unknown" — a service must never leak a
 * raw database message into the interface.
 */

import type { Result } from "../types";
import { fail } from "../types";

/** Messages raised by `raise exception '…'` inside the SQL functions. */
const RPC_CODES: Record<string, string> = {
  not_authenticated: "auth/not-authenticated",
  forbidden: "account/forbidden",
  account_banned: "account/banned",
  account_frozen: "account/frozen",
  account_self_excluded: "account/self-excluded",
  insufficient_funds: "wallet/insufficient-funds",
  invalid_amount: "wallet/invalid-amount",
  invalid_address: "wallet/invalid-address",
  demo_limit_reached: "wallet/demo-limit",
  invalid_code: "bonus/invalid-code",
  already_claimed: "bonus/already-claimed",
  empty_slip: "bets/empty-slip",
  invalid_stake: "bets/invalid-stake",
  invalid_bet_type: "bets/invalid-type",
};

/** GoTrue returns prose, not codes, so the mapping has to match on text. */
const AUTH_PATTERNS: [RegExp, string][] = [
  [/invalid login credentials|invalid email or password/i, "auth/invalid-credentials"],
  [/already registered|already been registered|user already exists/i, "auth/email-taken"],
  [/email not confirmed|confirm your email/i, "auth/email-not-confirmed"],
  [/new password should be different/i, "auth/password-unchanged"],
  [/password should be at least|password is too weak|weak.?password/i, "auth/weak-password"],
  [/rate limit|for security purposes|too many requests/i, "auth/rate-limited"],
  [/jwt expired|invalid claim|session.{0,10}(missing|expired)/i, "auth/not-authenticated"],
];

/** Constraint names from 0001_schema.sql, reported inside 23505 messages. */
const UNIQUE_PATTERNS: [RegExp, string][] = [
  [/nickname/i, "auth/nickname-taken"],
  [/email/i, "auth/email-taken"],
];

interface ErrorShape {
  message: string;
  code: string;
}

function readError(error: unknown): ErrorShape {
  if (typeof error === "string") return { message: error, code: "" };
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    const details = typeof record.details === "string" ? record.details : "";
    const message = typeof record.message === "string" ? record.message : "";
    return {
      message: `${message} ${details}`.trim(),
      code: typeof record.code === "string" ? record.code : "",
    };
  }
  return { message: "", code: "" };
}

/** Translates any thrown/returned Supabase error into a stable service code. */
export function errorCode(error: unknown): string {
  if (!error) return "unknown";
  const { message, code } = readError(error);

  const raised = RPC_CODES[message.trim()];
  if (raised) return raised;

  // 23505 unique_violation — the only constraint clashes a player can trigger.
  if (code === "23505") {
    for (const [pattern, mapped] of UNIQUE_PATTERNS) {
      if (pattern.test(message)) return mapped;
    }
  }
  // 23514 check_violation on balances.amount means the ledger would go negative.
  if (code === "23514" && /balances|amount/i.test(message)) return "wallet/insufficient-funds";
  // 42501 / PostgREST 42501 — an RLS policy refused the write.
  if (code === "42501") return "account/forbidden";
  if (code === "PGRST301" || code === "401") return "auth/not-authenticated";

  for (const [pattern, mapped] of AUTH_PATTERNS) {
    if (pattern.test(message)) return mapped;
  }
  return "unknown";
}

/** Shorthand for `fail(errorCode(error))` at every catch site. */
export function failFrom<T = never>(error: unknown): Result<T> {
  return fail<T>(errorCode(error));
}
