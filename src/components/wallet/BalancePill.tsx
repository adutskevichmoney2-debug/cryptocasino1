"use client";

import { ChevronDown, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dropdown, DropdownItem, DropdownSeparator } from "@/components/ui/Dropdown";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { CoinIcon } from "./CoinIcon";
import { useWalletStore } from "@/stores/walletStore";
import { useUiStore } from "@/stores/uiStore";
import { useFiat } from "@/hooks/useFiat";
import { formatCrypto, formatFiat } from "@/lib/format";

export function BalancePill() {
  const t = useTranslations("wallet");
  const balances = useWalletStore((s) => s.balances);
  const activeCoin = useWalletStore((s) => s.activeCoin);
  const setActiveCoin = useWalletStore((s) => s.setActiveCoin);
  const showFiat = useWalletStore((s) => s.showFiat);
  const toggleFiat = useWalletStore((s) => s.toggleFiat);
  const openModal = useUiStore((s) => s.openModal);
  const { toFiat, toFiatValue, fiatCurrency } = useFiat();

  const active = balances.find((b) => b.coin === activeCoin);
  const amount = active?.amount ?? 0;

  return (
    <div className="flex items-stretch">
      <Dropdown
        align="right"
        width="w-72"
        trigger={(open) => (
          <button
            type="button"
            aria-expanded={open}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-l-lg border border-r-0 border-line-strong bg-surface-2 pl-2.5 pr-2 transition-colors duration-120 hover:bg-surface-3"
          >
            <CoinIcon coin={activeCoin} size="sm" />
            <AnimatedNumber
              value={showFiat ? toFiatValue(activeCoin, amount) : amount}
              format={(v) =>
                showFiat ? formatFiat(v, fiatCurrency) : formatCrypto(v, 6)
              }
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
          >
            <CoinIcon coin={b.coin} size="sm" />
            <span className="font-semibold">{b.coin}</span>
            <span className="ml-auto flex flex-col items-end">
              <span className="tabular-nums text-content">{formatCrypto(b.amount, 6)}</span>
              <span className="text-[11px] tabular-nums text-content-tertiary">
                {toFiat(b.coin, b.amount)}
              </span>
            </span>
          </DropdownItem>
        ))}
        <DropdownSeparator />
        <div className="px-2.5 py-1.5">
          <Switch checked={showFiat} onCheckedChange={toggleFiat} label={t("showFiat")} />
        </div>
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
