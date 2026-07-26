import type { Network } from "@/services/types";
import { seededRng } from "./rng";

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const HEX = "0123456789abcdef";
const BECH32 = "023456789acdefghjklmnpqrstuvwxyz";

function build(rng: () => number, alphabet: string, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[Math.floor(rng() * alphabet.length)];
  return out;
}

/**
 * Deterministic per user+coin+network, matching each chain's address shape.
 * A real integration returns these from the payment provider.
 */
export function generateAddress(seed: string, network: Network): string {
  const rng = seededRng(`${seed}:${network}`);
  switch (network) {
    case "BTC":
      return `bc1q${build(rng, BECH32, 38)}`;
    case "TRC20":
      return `T${build(rng, BASE58, 33)}`;
    case "ERC20":
    case "BEP20":
      return `0x${build(rng, HEX, 40)}`;
    case "SOL":
      return build(rng, BASE58, 44);
    case "LTC":
      return `ltc1q${build(rng, BECH32, 38)}`;
    case "DOGE":
      return `D${build(rng, BASE58, 33)}`;
  }
}

const PATTERNS: Record<Network, RegExp> = {
  BTC: /^(bc1[a-z0-9]{25,59}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  TRC20: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
  ERC20: /^0x[a-fA-F0-9]{40}$/,
  BEP20: /^0x[a-fA-F0-9]{40}$/,
  SOL: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  LTC: /^(ltc1[a-z0-9]{25,59}|[LM3][a-km-zA-HJ-NP-Z1-9]{26,33})$/,
  DOGE: /^D[5-9A-HJ-NP-U][1-9A-HJ-NP-Za-km-z]{32}$/,
};

export function isValidAddress(address: string, network: Network): boolean {
  return PATTERNS[network].test(address.trim());
}

/** Human-readable example used as the input placeholder. */
export function addressPlaceholder(network: Network): string {
  switch (network) {
    case "BTC":
      return "bc1q…";
    case "TRC20":
      return "T…";
    case "ERC20":
    case "BEP20":
      return "0x…";
    case "SOL":
      return "5F…";
    case "LTC":
      return "ltc1q…";
    case "DOGE":
      return "D…";
  }
}
