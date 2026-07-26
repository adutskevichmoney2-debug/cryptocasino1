import type { OddsFormat } from "@/stores/settingsStore";

/** Best fraction approximation of (decimal - 1) with a small denominator. */
function toFractional(decimal: number): string {
  const target = decimal - 1;
  let best = { n: 1, d: 1, err: Math.abs(target - 1) };
  for (let d = 1; d <= 20; d++) {
    const n = Math.max(1, Math.round(target * d));
    const err = Math.abs(target - n / d);
    if (err < best.err - 1e-9) best = { n, d, err };
  }
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(best.n, best.d);
  return `${best.n / g}/${best.d / g}`;
}

function toAmerican(decimal: number): string {
  if (decimal >= 2) return `+${Math.round((decimal - 1) * 100)}`;
  return `−${Math.round(100 / (decimal - 1))}`;
}

export function formatOdds(decimal: number, format: OddsFormat): string {
  switch (format) {
    case "fractional":
      return toFractional(decimal);
    case "american":
      return toAmerican(decimal);
    default:
      return decimal.toFixed(2);
  }
}
