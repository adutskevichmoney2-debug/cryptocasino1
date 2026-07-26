import type { Coin, CoinMeta, Network } from "../../types";

export const COINS: CoinMeta[] = [
  { coin: "BTC", name: "Bitcoin", networks: ["BTC"], decimals: 8, minDeposit: 0.0001, minWithdraw: 0.0005 },
  { coin: "ETH", name: "Ethereum", networks: ["ERC20", "BEP20"], decimals: 6, minDeposit: 0.005, minWithdraw: 0.01 },
  {
    coin: "USDT",
    name: "Tether",
    networks: ["TRC20", "ERC20", "BEP20"],
    decimals: 2,
    minDeposit: 10,
    minWithdraw: 20,
  },
  { coin: "USDC", name: "USD Coin", networks: ["ERC20", "BEP20", "SOL"], decimals: 2, minDeposit: 10, minWithdraw: 20 },
  { coin: "TRX", name: "Tron", networks: ["TRC20"], decimals: 2, minDeposit: 50, minWithdraw: 100 },
  { coin: "SOL", name: "Solana", networks: ["SOL"], decimals: 4, minDeposit: 0.05, minWithdraw: 0.1 },
  { coin: "LTC", name: "Litecoin", networks: ["LTC"], decimals: 6, minDeposit: 0.01, minWithdraw: 0.02 },
  { coin: "DOGE", name: "Dogecoin", networks: ["DOGE"], decimals: 2, minDeposit: 30, minWithdraw: 60 },
];

/** Indicative USD rates. A real build would poll a price feed. */
export const RATES: Record<Coin, number> = {
  BTC: 96400,
  ETH: 3180,
  USDT: 1,
  USDC: 1,
  TRX: 0.24,
  SOL: 184,
  LTC: 104,
  DOGE: 0.33,
};

/** Withdrawal fee charged in the coin itself, keyed by coin then network. */
export const WITHDRAW_FEES: Record<Coin, Partial<Record<Network, number>>> = {
  BTC: { BTC: 0.0002 },
  ETH: { ERC20: 0.0025, BEP20: 0.0004 },
  USDT: { TRC20: 1, ERC20: 8, BEP20: 0.8 },
  USDC: { ERC20: 8, BEP20: 0.8, SOL: 0.5 },
  TRX: { TRC20: 2 },
  SOL: { SOL: 0.01 },
  LTC: { LTC: 0.001 },
  DOGE: { DOGE: 5 },
};

/** Approximate confirmation time per network, shown in the deposit panel. */
export const NETWORK_CONFIRM_MIN: Record<Network, number> = {
  BTC: 30,
  ERC20: 5,
  TRC20: 2,
  BEP20: 3,
  SOL: 1,
  LTC: 10,
  DOGE: 15,
};

export const FIAT_CURRENCIES = ["USD", "EUR", "RUB"] as const;
export type FiatCurrency = (typeof FIAT_CURRENCIES)[number];

/** USD -> fiat conversion for the display-currency toggle. */
export const FIAT_RATES: Record<FiatCurrency, number> = {
  USD: 1,
  EUR: 0.92,
  RUB: 92,
};
