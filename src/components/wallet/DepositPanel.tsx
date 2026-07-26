"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Sparkles } from "lucide-react";
import { services } from "@/services";
import { useAsync } from "@/hooks/useAsync";
import { useWalletStore } from "@/stores/walletStore";
import { useUiStore } from "@/stores/uiStore";
import { CoinSelect } from "./CoinSelect";
import { NetworkSelect } from "./NetworkSelect";
import { CopyField } from "@/components/ui/CopyField";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NETWORK_CONFIRM_MIN } from "@/services/mock/fixtures/coins";
import { formatCrypto } from "@/lib/format";
import type { Coin, CoinMeta, Network } from "@/services/types";

export function DepositPanel({ coins }: { coins: CoinMeta[] }) {
  const t = useTranslations("wallet");
  const tCommon = useTranslations("common");
  const pushToast = useUiStore((s) => s.pushToast);
  const activeCoin = useWalletStore((s) => s.activeCoin);
  const setActiveCoin = useWalletStore((s) => s.setActiveCoin);

  const [coin, setCoin] = useState<Coin>(activeCoin);
  const meta = useMemo(() => coins.find((c) => c.coin === coin) ?? coins[0], [coins, coin]);
  const [network, setNetwork] = useState<Network>(meta.networks[0]);
  const [demoAmount, setDemoAmount] = useState("100");
  const [crediting, setCrediting] = useState(false);

  useEffect(() => {
    if (!meta.networks.includes(network)) setNetwork(meta.networks[0]);
  }, [meta, network]);

  const { data: depositInfo, loading } = useAsync(
    () => services.wallet.getDepositAddress(coin, network),
    [coin, network],
  );

  const handleDemoCredit = async () => {
    const amount = Number(demoAmount.replace(",", "."));
    setCrediting(true);
    const result = await services.wallet.simulateDeposit(coin, amount);
    setCrediting(false);
    if (!result.ok) {
      pushToast("error", t("demoCredited", { amount: 0, coin }));
      return;
    }
    setActiveCoin(coin);
    pushToast("success", t("demoCredited", { amount: formatCrypto(amount), coin }));
    void services.notifications.push({
      key: "depositCredited",
      values: { amount: formatCrypto(amount), coin },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <CoinSelect coins={coins} value={coin} onValueChange={setCoin} />
      <NetworkSelect networks={meta.networks} value={network} onValueChange={setNetwork} />

      <div className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-content-secondary">
          {t("depositAddress", { coin })}
        </span>
        {loading || !depositInfo ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <CopyField value={depositInfo.address} />
        )}
      </div>

      <div className="flex items-start gap-4 rounded-xl border border-line bg-surface-2 p-3.5">
        <div className="shrink-0 rounded-lg bg-white p-2">
          {loading || !depositInfo ? (
            <Skeleton className="size-[92px]" />
          ) : (
            <QRCodeSVG value={depositInfo.address} size={92} marginSize={0} />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-1.5 text-[13px]">
          <p className="text-content-secondary">
            {t("minDeposit")}:{" "}
            <span className="font-semibold tabular-nums text-content">
              {formatCrypto(meta.minDeposit)} {coin}
            </span>
          </p>
          <p className="text-content-tertiary">
            {t("confirmTime", { minutes: NETWORK_CONFIRM_MIN[network] })}
          </p>
        </div>
      </div>

      <p className="flex items-start gap-2 rounded-lg bg-warning-soft p-3 text-xs leading-relaxed text-warning">
        <AlertTriangle className="mt-px size-3.5 shrink-0" />
        {t("networkWarning", { coin, network })}
      </p>

      <div className="relative my-1 text-center">
        <span className="absolute inset-x-0 top-1/2 h-px bg-line" aria-hidden="true" />
        <span className="relative bg-surface-1 px-3 text-[11px] font-bold uppercase tracking-wider text-content-disabled">
          {t("demoDivider")}
        </span>
      </div>

      <p className="text-[13px] leading-relaxed text-content-tertiary">{t("demoDepositHint")}</p>

      <div className="flex items-end gap-2">
        <Input
          label={t("demoAmount")}
          inputMode="decimal"
          value={demoAmount}
          onChange={(e) => setDemoAmount(e.target.value)}
          rightSlot={<span className="text-xs font-bold">{coin}</span>}
        />
        <Button
          variant="soft"
          className="shrink-0"
          loading={crediting}
          disabled={!Number.isFinite(Number(demoAmount.replace(",", "."))) || Number(demoAmount.replace(",", ".")) <= 0}
          onClick={handleDemoCredit}
        >
          <Sparkles className="size-4" />
          {t("demoCredit")}
          <Badge variant="accent" className="ml-1">
            {tCommon("demo")}
          </Badge>
        </Button>
      </div>
    </div>
  );
}
