"use client";

import { useTranslations } from "next-intl";
import { Chip } from "@/components/ui/Chip";
import type { Network } from "@/services/types";

export function NetworkSelect({
  networks,
  value,
  onValueChange,
}: {
  networks: Network[];
  value: Network;
  onValueChange: (network: Network) => void;
}) {
  const t = useTranslations("wallet");

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-content-secondary">{t("network")}</span>
      <div className="flex flex-wrap gap-2">
        {networks.map((n) => (
          <Chip key={n} active={n === value} onClick={() => onValueChange(n)} className="rounded-lg">
            {n}
          </Chip>
        ))}
      </div>
    </div>
  );
}
