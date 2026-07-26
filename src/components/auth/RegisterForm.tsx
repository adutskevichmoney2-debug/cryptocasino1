"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AlertCircle, Gift, Mail, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { registerSchema, type RegisterValues } from "@/lib/validation";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useServiceError } from "@/hooks/useServiceError";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";

export function RegisterForm({
  onSwitchToLogin,
  initialRefCode,
}: {
  onSwitchToLogin: () => void;
  initialRefCode?: string;
}) {
  const t = useTranslations("auth");
  const tv = useTranslations("validation");
  const translateError = useServiceError();
  const registerUser = useAuthStore((s) => s.register);
  const closeModal = useUiStore((s) => s.closeModal);
  const pushToast = useUiStore((s) => s.pushToast);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { refCode: initialRefCode ?? "" },
  });

  const onSubmit = async (values: RegisterValues) => {
    setFormError(null);
    const result = await registerUser({
      email: values.email,
      password: values.password,
      nickname: values.nickname,
      refCode: values.refCode || undefined,
    });
    if (!result.ok) {
      setFormError(translateError(result.error));
      return;
    }
    closeModal();
    pushToast("success", t("accountCreated", { nickname: result.data.user.nickname }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div>
        <h3 className="font-display text-lg font-bold text-content">{t("registerTitle")}</h3>
        <p className="mt-1 text-[13px] text-content-tertiary">{t("registerSubtitle")}</p>
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

      <Input
        {...register("nickname")}
        autoComplete="username"
        label={t("nickname")}
        placeholder={t("nicknamePlaceholder")}
        leftSlot={<User />}
        error={errors.nickname && tv(errors.nickname.message as never)}
      />

      <PasswordInput
        {...register("password")}
        autoComplete="new-password"
        label={t("password")}
        placeholder={t("passwordPlaceholder")}
        error={errors.password && tv(errors.password.message as never)}
      />

      <PasswordInput
        {...register("confirmPassword")}
        autoComplete="new-password"
        label={t("confirmPassword")}
        error={errors.confirmPassword && tv(errors.confirmPassword.message as never)}
      />

      <Input
        {...register("refCode")}
        label={t("refCodeOptional")}
        leftSlot={<Gift />}
        error={errors.refCode && tv(errors.refCode.message as never)}
      />

      <Checkbox
        {...register("terms")}
        error={errors.terms && tv(errors.terms.message as never)}
        label={t.rich("terms", {
          terms: (chunks) => (
            <Link href="/legal/terms" className="text-accent hover:underline">
              {chunks}
            </Link>
          ),
          privacy: (chunks) => (
            <Link href="/legal/privacy" className="text-accent hover:underline">
              {chunks}
            </Link>
          ),
        })}
      />

      <Button type="submit" size="lg" full loading={isSubmitting}>
        {t("register")}
      </Button>

      <p className="text-center text-[13px] text-content-tertiary">
        {t("haveAccount")}{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="cursor-pointer font-semibold text-accent hover:underline"
        >
          {t("signInNow")}
        </button>
      </p>
    </form>
  );
}
