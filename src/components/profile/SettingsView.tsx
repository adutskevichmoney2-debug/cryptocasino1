"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { services } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useUiStore } from "@/stores/uiStore";
import { useServiceError } from "@/hooks/useServiceError";
import { profileSchema, type ProfileValues } from "@/lib/validation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Avatar, AVATAR_GRADIENTS } from "@/components/ui/Avatar";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { cn } from "@/lib/cn";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="mb-4 font-display text-base font-bold text-content">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </Card>
  );
}

export function SettingsView() {
  const t = useTranslations("profile.settings");
  const tCommon = useTranslations("common");
  const tv = useTranslations("validation");
  const translateError = useServiceError();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const pushToast = useUiStore((s) => s.pushToast);

  const oddsFormat = useSettingsStore((s) => s.oddsFormat);
  const setOddsFormat = useSettingsStore((s) => s.setOddsFormat);
  const hideStats = useSettingsStore((s) => s.hideStats);
  const setHideStats = useSettingsStore((s) => s.setHideStats);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const setReduceMotion = useSettingsStore((s) => s.setReduceMotion);

  const [savingAvatar, setSavingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nickname: user?.nickname ?? "" },
  });

  if (!user) return null;

  const saveNickname = async (values: ProfileValues) => {
    const result = await services.auth.updateProfile({ nickname: values.nickname });
    if (!result.ok) {
      pushToast("error", translateError(result.error));
      return;
    }
    setUser(result.data);
    pushToast("success", tCommon("saved"));
  };

  const pickAvatar = async (avatarId: number) => {
    if (avatarId === user.avatarId || savingAvatar) return;
    setSavingAvatar(true);
    const result = await services.auth.updateProfile({ avatarId });
    setSavingAvatar(false);
    if (result.ok) {
      setUser(result.data);
      pushToast("success", tCommon("saved"));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title={t("profileSection")}>
        <form
          onSubmit={handleSubmit(saveNickname)}
          className="flex items-end gap-2"
          noValidate
        >
          <Input
            {...register("nickname")}
            label={t("nickname")}
            error={errors.nickname && tv(errors.nickname.message as never)}
          />
          <Button type="submit" loading={isSubmitting} className="shrink-0">
            {tCommon("save")}
          </Button>
        </form>

        <div>
          <p className="mb-2 text-[13px] font-medium text-content-secondary">{t("avatar")}</p>
          <div className="flex flex-wrap gap-2">
            {AVATAR_GRADIENTS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => void pickAvatar(i)}
                aria-pressed={user.avatarId === i}
                className={cn(
                  "cursor-pointer rounded-full transition-transform duration-120 hover:scale-105",
                  user.avatarId === i && "ring-2 ring-accent ring-offset-2 ring-offset-surface-1",
                )}
              >
                <Avatar nickname={user.nickname} avatarId={i} size="md" />
              </button>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t("preferences")}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-content">{t("language")}</p>
          <LanguageSwitcher />
        </div>

        <Select
          label={t("oddsFormat")}
          value={oddsFormat}
          onChange={(e) => setOddsFormat(e.target.value as typeof oddsFormat)}
          options={[
            { value: "decimal", label: t("decimal") },
            { value: "fractional", label: t("fractional") },
            { value: "american", label: t("american") },
          ]}
        />
      </SectionCard>

      <SectionCard title={t("privacy")}>
        <Switch
          checked={hideStats}
          onCheckedChange={setHideStats}
          label={t("hideStats")}
          description={t("hideStatsHint")}
        />
        <Switch
          checked={reduceMotion}
          onCheckedChange={setReduceMotion}
          label={t("reduceMotion")}
          description={t("reduceMotionHint")}
        />
      </SectionCard>
    </div>
  );
}
