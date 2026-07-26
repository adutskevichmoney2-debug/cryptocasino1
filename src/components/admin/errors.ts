/** Maps the RPC's `raise exception` codes to operator-readable text. */
const MESSAGES: Record<string, string> = {
  forbidden: "Your role is not allowed to perform this action.",
  insufficient_funds: "The player does not have enough balance for this movement.",
  invalid_amount: "Enter a non-zero amount.",
  cannot_target_self: "You cannot perform this action on your own account.",
  already_settled: "This transaction has already been settled.",
  not_found: "The record no longer exists.",
  not_authenticated: "Your session expired — sign in again.",
};

export function errorText(error: unknown, fallback = "Something went wrong"): string {
  if (!error) return fallback;
  const raw =
    typeof error === "string"
      ? error
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "";
  if (!raw) return fallback;
  for (const [code, text] of Object.entries(MESSAGES)) {
    if (raw.includes(code)) return text;
  }
  return raw;
}
