"use client";

import { ChevronDown, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dropdown, DropdownItem } from "@/components/ui/Dropdown";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Button } from "@/components/ui/Button";
import { CoinIcon } from "./CoinIcon";
import { useWalletStore } from "@/stores/walletStore";
import { useUiStore } from "@/stores/uiStore";
import { formatCrypto } from "@/lib/format";

export function BalancePill() {
  const t = useTranslations("wallet");
  const balances = useWalletStore((s) => s.balances);
  const activeCoin = useWalletStore((s) => s.activeCoin);
  const setActiveCoin = useWalletStore((s) => s.setActiveCoin);
  const openModal = useUiStore((s) => s.openModal);

  const active = balances.find((b) => b.coin === activeCoin);
  const amount = active?.amount ?? 0;

  return (
    <div className="flex items-stretch">
      <Dropdown
        align="right"
        width="w-[min(13.5rem,calc(100vw-1.5rem))] max-h-[min(400px,65dvh)] overflow-y-auto"
        trigger={(open) => (
          <button
            type="button"
            aria-expanded={open}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-l-lg border border-r-0 border-line-strong bg-surface-2 pl-2.5 pr-2 transition-colors duration-120 hover:bg-surface-3"
          >
            <CoinIcon coin={activeCoin} size="sm" />
            <AnimatedNumber
              value={amount}
              format={(v) => formatCrypto(v, 6)}
              className="text-[13px] font-bold text-content"
            />
            <ChevronDown className="size-3.5 text-content-tertiary" />
          </button>
        )}
      >
        {balances.map((b) => (
          <DropdownItem
            key={b.coin}
            active={b.coin === activeCoin}
            onSelect={() => setActiveCoin(b.coin)}
            className="py-1.5"
          >
            <CoinIcon coin={b.coin} size="sm" />
            <span className="font-semibold">{b.coin}</span>
            <span className="ml-auto tabular-nums text-content">{formatCrypto(b.amount, 6)}</span>
          </DropdownItem>
        ))}
      </Dropdown>

      <Button
        size="sm"
        className="h-9 rounded-l-none px-3"
        onClick={() => openModal("wallet", { tab: "deposit" })}
      >
        <Wallet className="size-4" />
        <span className="max-sm:hidden">{t("deposit")}</span>
      </Button>
    </div>
  );
}
