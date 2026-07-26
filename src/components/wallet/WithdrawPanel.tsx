"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useWalletStore } from "@/stores/walletStore";
import { useUiStore } from "@/stores/uiStore";
import { useServiceError } from "@/hooks/useServiceError";
import { CoinSelect } from "./CoinSelect";
import { NetworkSelect } from "./NetworkSelect";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { addressPlaceholder } from "@/lib/address";
import { formatCrypto } from "@/lib/format";
import type { Coin, CoinMeta, Network } from "@/services/types";

export function WithdrawPanel({ coins }: { coins: CoinMeta[] }) {
  const t = useTranslations("wallet");
  const translateError = useServiceError();
  const pushToast = useUiStore((s) => s.pushToast);
  const balanceOf = useWalletStore((s) => s.balanceOf);
  const activeCoin = useWalletStore((s) => s.activeCoin);

  const [coin, setCoin] = useState<Coin>(activeCoin);
  const meta = useMemo(() => coins.find((c) => c.coin === coin) ?? coins[0], [coins, coin]);
  const [network, setNetwork] = useState<Network>(meta.networks[0]);
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meta.networks.includes(network)) setNetwork(meta.networks[0]);
  }, [meta, network]);

  const { data: fee } = useAsync(() => services.wallet.getWithdrawFee(coin, network), [coin, network]);

  const balance = balanceOf(coin);
  const numericAmount = Number(amount.replace(",", "."));
  const receive = Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : 0;
  const totalDeducted = receive + (fee ?? 0);

  const setMax = () => {
    const max = Math.max(0, balance - (fee ?? 0));
    setAmount(formatCrypto(max, meta.decimals).replace(/,/g, ""));
  };

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    const result = await services.wallet.requestWithdraw({
      coin,
      network,
      address,
      amount: numericAmount,
    });
    setSubmitting(false);
    if (!result.ok) {
      setError(translateError(result.error));
      return;
    }
    setAddress("");
    setAmount("");
    pushToast("success", t("withdrawRequested"));
  };

  return (
    <div className="flex flex-col gap-4">
      <CoinSelect coins={coins} value={coin} onValueChange={setCoin} />
      <NetworkSelect networks={meta.networks} value={network} onValueChange={setNetwork} />

      <Input
        label={t("withdrawAddress")}
        placeholder={t("addressPlaceholder", { network })}
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        hint={addressPlaceholder(network)}
        className="font-mono"
      />

      <div>
        <Input
          label={t("amount")}
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={error ?? undefined}
          rightSlot={
            <button
              type="button"
              onClick={setMax}
              className="cursor-pointer rounded bg-surface-4 px-1.5 py-0.5 text-[11px] font-bold text-accent transition-colors duration-120 hover:bg-graphite-500"
            >
              {t("max")}
            </button>
          }
        />
        <p className="mt-1.5 text-xs text-content-tertiary">
          {t("available")}:{" "}
          <span className="tabular-nums text-content-secondary">
            {formatCrypto(balance, 6)} {coin}
          </span>{" "}
          · {t("minWithdraw")}:{" "}
          <span className="tabular-nums">
            {formatCrypto(meta.minWithdraw)} {coin}
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2 p-3.5 text-[13px]">
        <div className="flex justify-between">
          <span className="text-content-tertiary">{t("fee")}</span>
          <span className="tabular-nums text-content-secondary">
            {fee !== null && fee !== undefined ? `${formatCrypto(fee)} ${coin}` : "—"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-content-tertiary">{t("totalDeducted")}</span>
          <span className="tabular-nums text-content-secondary">
            {formatCrypto(totalDeducted, 6)} {coin}
          </span>
        </div>
        <div className="flex justify-between border-t border-line pt-2">
          <span className="font-semibold text-content">{t("youReceive")}</span>
          <span className="font-semibold tabular-nums text-content">
            {formatCrypto(receive, 6)} {coin}
          </span>
        </div>
      </div>

      <Button size="lg" full loading={submitting} disabled={!address || receive <= 0} onClick={handleSubmit}>
        {t("requestWithdraw")}
      </Button>
    </div>
  );
}
