"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { CoinIcon } from "./CoinIcon";
import { useWalletStore } from "@/stores/walletStore";
import { formatCrypto } from "@/lib/format";
import type { Coin, CoinMeta } from "@/services/types";

export function CoinSelect({
  coins,
  value,
  onValueChange,
  showBalances = true,
}: {
  coins: CoinMeta[];
  value: Coin;
  onValueChange: (coin: Coin) => void;
  showBalances?: boolean;
}) {
  const t = useTranslations("wallet");
  const balanceOf = useWalletStore((s) => s.balanceOf);
  const selected = coins.find((c) => c.coin === value);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-content-secondary">{t("coin")}</span>
      <Dropdown
        align="left"
        width="w-full"
        className="w-full"
        trigger={(open) => (
          <button
            type="button"
            className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-md border border-line-strong bg-surface-2 px-3 transition-colors duration-120 hover:border-graphite-500"
            aria-expanded={open}
          >
            <CoinIcon coin={value} />
            <span className="text-sm font-semibold text-content">{value}</span>
            <span className="text-[13px] text-content-tertiary">{selected?.name}</span>
            <ChevronDown className="ml-auto size-4 text-content-tertiary" />
          </button>
        )}
      >
        {coins.map((c) => (
          <DropdownItem key={c.coin} active={c.coin === value} onSelect={() => onValueChange(c.coin)}>
            <CoinIcon coin={c.coin} size="sm" />
            <span className="font-semibold">{c.coin}</span>
            <span className="text-content-tertiary">{c.name}</span>
            {showBalances && (
              <span className="ml-auto tabular-nums text-content-secondary">
                {formatCrypto(balanceOf(c.coin), 6)}
              </span>
            )}
          </DropdownItem>
        ))}
      </Dropdown>
    </div>
  );
}
