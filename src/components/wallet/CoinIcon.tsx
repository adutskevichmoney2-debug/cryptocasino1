import type { Coin } from "@/services/types";
import { cn } from "@/lib/cn";

const COIN_STYLE: Record<Coin, { bg: string; symbol: string }> = {
  BTC: { bg: "#f7931a", symbol: "₿" },
  ETH: { bg: "#627eea", symbol: "Ξ" },
  USDT: { bg: "#26a17b", symbol: "₮" },
  USDC: { bg: "#2775ca", symbol: "$" },
  TRX: { bg: "#eb0029", symbol: "T" },
  SOL: { bg: "#9945ff", symbol: "S" },
  LTC: { bg: "#8e9bae", symbol: "Ł" },
  DOGE: { bg: "#c2a633", symbol: "Ð" },
};

const SIZES = { sm: "size-5 text-[10px]", md: "size-6 text-[11px]", lg: "size-8 text-sm" } as const;

export function CoinIcon({
  coin,
  size = "md",
  className,
}: {
  coin: Coin;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const style = COIN_STYLE[coin];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold text-white",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: style.bg }}
    >
      {style.symbol}
    </span>
  );
}
