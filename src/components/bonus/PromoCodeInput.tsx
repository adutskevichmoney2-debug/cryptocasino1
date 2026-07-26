"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TicketPercent } from "lucide-react";
import { services } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useServiceError } from "@/hooks/useServiceError";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function PromoCodeInput({ onClaimed }: { onClaimed?: () => void }) {
  const t = useTranslations("promotions");
  const translateError = useServiceError();
  const status = useAuthStore((s) => s.status);
  const openModal = useUiStore((s) => s.openModal);
  const pushToast = useUiStore((s) => s.pushToast);

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    if (status !== "authed") {
      openModal("login");
      return;
    }
    setError(null);
    setLoading(true);
    const result = await services.bonus.claimPromoCode(code);
    setLoading(false);
    if (!result.ok) {
      setError(translateError(result.error));
      return;
    }
    setCode("");
    pushToast("success", t("codeApplied", { code: result.data.code }));
    void services.notifications.push({ key: "bonusClaimed", values: { code: result.data.code } });
    onClaimed?.();
  };

  return (
    <div className="rounded-xl border border-line bg-surface-1 p-4 shadow-card">
      <div className="flex items-end gap-2">
        <Input
          label={t("promoCode")}
          placeholder={t("promoCodePlaceholder")}
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && void apply()}
          leftSlot={<TicketPercent />}
          error={error ?? undefined}
          className="uppercase"
        />
        <Button onClick={apply} loading={loading} disabled={!code.trim()} className="shrink-0">
          {t("apply")}
        </Button>
      </div>
      <p className="mt-2 text-xs text-content-disabled">{t("hintCodes")}</p>
    </div>
  );
}
