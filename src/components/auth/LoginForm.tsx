"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AlertCircle, Mail } from "lucide-react";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useServiceError } from "@/hooks/useServiceError";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";

export function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const translateError = useServiceError();
  const login = useAuthStore((s) => s.login);
  const closeModal = useUiStore((s) => s.closeModal);
  const pushToast = useUiStore((s) => s.pushToast);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);
    const result = await login(values);
    if (!result.ok) {
      setFormError(translateError(result.error));
      return;
    }
    closeModal();
    pushToast("success", t("welcomeBack", { nickname: result.data.user.nickname }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div>
        <h3 className="font-display text-lg font-bold text-content">{t("loginTitle")}</h3>
        <p className="mt-1 text-[13px] text-content-tertiary">{t("loginSubtitle")}</p>
      </div>

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-danger/30 bg-danger-soft p-3"
        >
          <AlertCircle className="mt-px size-4 shrink-0 text-danger" />
          <p className="text-[13px] text-danger">{formError}</p>
        </div>
      )}

      <Input
        {...register("email")}
        type="email"
        autoComplete="email"
        label={t("email")}
        placeholder={t("emailPlaceholder")}
        leftSlot={<Mail />}
        error={errors.email && tv(errors.email.message as never)}
      />

      <div>
        <PasswordInput
          {...register("password")}
          autoComplete="current-password"
          label={t("password")}
          placeholder={t("passwordPlaceholder")}
          error={errors.password && tv(errors.password.message as never)}
        />
        <button
          type="button"
          onClick={() => pushToast("info", t("forgotHint"))}
          className="mt-1.5 cursor-pointer text-xs text-content-tertiary transition-colors duration-120 hover:text-accent"
        >
          {t("forgotPassword")}
        </button>
      </div>

      <Button type="submit" size="lg" full loading={isSubmitting}>
        {t("login")}
      </Button>

      <p className="text-center text-[13px] text-content-tertiary">
        {t("noAccount")}{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="cursor-pointer font-semibold text-accent hover:underline"
        >
          {t("signUpNow")}
        </button>
      </p>
    </form>
  );
}
