/** Formats a crypto amount: up to 8 decimals, trailing zeros trimmed, thousands separated. */
export function formatCrypto(amount: number, maxDecimals = 8): string {
  if (!Number.isFinite(amount)) return "0";
  const fixed = amount.toFixed(maxDecimals);
  const trimmed = fixed.replace(/\.?0+$/, "");
  const [int, frac] = trimmed.split(".");
  const intFmt = Number(int).toLocaleString("en-US");
  return frac ? `${intFmt}.${frac}` : intFmt;
}

/** Formats a fiat amount with currency symbol, e.g. $1,234.56. */
export function formatFiat(amount: number, currency: string, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** 12345678 -> 12.3M */
export function formatCompact(n: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** TQrY8bkbpXKPt2LZbU8jnGfLKS4HTnnVDN -> TQrY8b…nnVDN */
export function shortenAddress(address: string, head = 6, tail = 5): string {
  if (address.length <= head + tail + 1) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

/** Masks a nickname for leaderboards: "CryptoKing" -> "Cr***ng" */
export function maskNickname(nick: string): string {
  if (nick.length <= 4) return nick[0] + "***";
  return `${nick.slice(0, 2)}***${nick.slice(-2)}`;
}
