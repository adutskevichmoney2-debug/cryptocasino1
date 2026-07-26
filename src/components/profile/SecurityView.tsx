"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { QRCodeSVG } from "qrcode.react";
import { MonitorSmartphone } from "lucide-react";
import { services } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useServiceError } from "@/hooks/useServiceError";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validation";
import { Card } from "@/components/ui/Card";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

export function SecurityView() {
  const t = useTranslations("profile.security");
  const tCommon = useTranslations("common");
  const tv = useTranslations("validation");
  const translateError = useServiceError();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const pushToast = useUiStore((s) => s.pushToast);

  const [twoFaSetupOpen, setTwoFaSetupOpen] = useState(false);
  const [code, setCode] = useState("");
  const [switching, setSwitching] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  if (!user) return null;

  const changePassword = async (values: ChangePasswordValues) => {
    const result = await services.auth.changePassword(values.current, values.next);
    if (!result.ok) {
      pushToast("error", translateError(result.error));
      return;
    }
    reset();
    pushToast("success", t("passwordChanged"));
  };

  const toggleTwoFa = async (enable: boolean) => {
    if (enable) {
      setTwoFaSetupOpen(true);
      return;
    }
    setSwitching(true);
    const result = await services.auth.updateProfile({ twoFactorEnabled: false });
    setSwitching(false);
    if (result.ok) {
      setUser(result.data);
      pushToast("info", t("twoFactorDisabledToast"));
    }
  };

  const activateTwoFa = async () => {
    if (code.trim().length !== 6) return;
    setSwitching(true);
    const result = await services.auth.updateProfile({ twoFactorEnabled: true });
    setSwitching(false);
    setTwoFaSetupOpen(false);
    setCode("");
    if (result.ok) {
      setUser(result.data);
      pushToast("success", t("twoFactorEnabledToast"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <h2 className="mb-4 font-display text-base font-bold text-content">{t("changePassword")}</h2>
        <form onSubmit={handleSubmit(changePassword)} className="flex max-w-md flex-col gap-4" noValidate>
          <PasswordInput
            {...register("current")}
            autoComplete="current-password"
            label={t("currentPassword")}
            error={errors.current && tv(errors.current.message as never)}
          />
          <PasswordInput
            {...register("next")}
            autoComplete="new-password"
            label={t("newPassword")}
            error={errors.next && tv(errors.next.message as never)}
          />
          <PasswordInput
            {...register("confirm")}
            autoComplete="new-password"
            label={t("confirmNew")}
            error={errors.confirm && tv(errors.confirm.message as never)}
          />
          <Button type="submit" loading={isSubmitting} className="self-start">
            {tCommon("save")}
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-bold text-content">
              {t("twoFactor")}
              <Badge variant="outline">{tCommon("demo")}</Badge>
            </h2>
            <p className="mt-1 max-w-md text-[13px] text-content-tertiary">{t("twoFactorHint")}</p>
          </div>
          <Switch
            checked={user.twoFactorEnabled}
            onCheckedChange={toggleTwoFa}
            disabled={switching}
            label={t("twoFactor")}
            className="[&>div]:hidden"
          />
        </div>

        {twoFaSetupOpen && !user.twoFactorEnabled && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-surface-2 p-4">
            <div className="rounded-lg bg-white p-2">
              <QRCodeSVG value={`otpauth://totp/CryptoCasino:${user.email}?secret=DEMOSECRET234567&issuer=CryptoCasino`} size={96} marginSize={0} />
            </div>
            <div className="flex min-w-[220px] flex-1 flex-col gap-2.5">
              <p className="text-[13px] text-content-secondary">{t("scanQr")}</p>
              <div className="flex gap-2">
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder={t("enterCode")}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="tabular-nums"
                />
                <Button
                  onClick={activateTwoFa}
                  loading={switching}
                  disabled={code.length !== 6}
                  className="shrink-0"
                >
                  {t("activate")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-display text-base font-bold text-content">{t("sessions")}</h2>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-surface-3">
            <MonitorSmartphone className="size-4 text-content-secondary" />
          </span>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-content">{t("currentDevice")}</p>
            <p className="text-xs text-content-tertiary">{t("currentBrowser")}</p>
          </div>
          <Badge variant="success">{t("currentDevice")}</Badge>
        </div>
        <p className="mt-2.5 text-xs text-content-disabled">{t("sessionsNote")}</p>
      </Card>
    </div>
  );
}
