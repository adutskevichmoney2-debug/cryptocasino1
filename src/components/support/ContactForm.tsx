"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { services } from "@/services";
import { useUiStore } from "@/stores/uiStore";
import { useServiceError } from "@/hooks/useServiceError";
import { contactSchema, type ContactValues } from "@/lib/validation";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const TOPICS = ["account", "payments", "bonuses", "technical", "other"] as const;

export function ContactForm() {
  const t = useTranslations("contact");
  const tv = useTranslations("validation");
  const translateError = useServiceError();
  const pushToast = useUiStore((s) => s.pushToast);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { topic: "account" },
  });

  const onSubmit = async (values: ContactValues) => {
    const result = await services.support.submitContactForm(values);
    if (!result.ok) {
      // A signed-out visitor always fails here (tickets are pinned to auth.uid()),
      // so the button must never look like it did nothing.
      pushToast("error", translateError(result.error));
      return;
    }
    reset();
    pushToast("success", t("sent"));
  };

  return (
    <Card className="mx-auto max-w-xl p-5 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          {...register("email")}
          type="email"
          label={t("email")}
          placeholder="you@example.com"
          leftSlot={<Mail />}
          error={errors.email && tv(errors.email.message as never)}
        />

        <Select
          {...register("topic")}
          label={t("topic")}
          options={TOPICS.map((topic) => ({ value: topic, label: t(`topics.${topic}`) }))}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-message" className="text-[13px] font-medium text-content-secondary">
            {t("message")}
          </label>
          <textarea
            id="contact-message"
            {...register("message")}
            rows={6}
            placeholder={t("messagePlaceholder")}
            className={cn(
              "w-full resize-y rounded-md border bg-surface-2 p-3 text-sm text-content outline-none transition-colors duration-120 placeholder:text-content-disabled",
              "focus:border-accent focus:ring-2 focus:ring-accent-soft",
              errors.message ? "border-danger" : "border-line-strong hover:border-graphite-500",
            )}
          />
          {errors.message && (
            <p role="alert" className="text-xs text-danger">
              {tv(errors.message.message as never)}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" loading={isSubmitting} className="self-start">
          {t("send")}
        </Button>
      </form>
    </Card>
  );
}
