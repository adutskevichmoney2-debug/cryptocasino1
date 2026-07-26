"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, BadgeCheck, Check, FileUp, Hourglass } from "lucide-react";
import { services } from "@/services";
import { useAuthStore } from "@/stores/authStore";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const VERIFY_AFTER_MS = 8000;

function Stepper({ current, labels }: { current: number; labels: string[] }) {
  return (
    <ol className="flex items-center gap-2">
      {labels.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                done
                  ? "bg-accent text-accent-content"
                  : active
                    ? "bg-accent-soft text-accent ring-1 ring-accent/40"
                    : "bg-surface-3 text-content-disabled",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span
              className={cn(
                "hidden text-[13px] font-semibold sm:block",
                active ? "text-content" : "text-content-tertiary",
              )}
            >
              {label}
            </span>
            {i < labels.length - 1 && <span className="h-px flex-1 bg-line" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}

export function KycView() {
  const t = useTranslations("profile.kyc");
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Demo: pending applications auto-verify shortly after submission
  useEffect(() => {
    if (user?.kycStatus !== "pending") return;
    const timer = setTimeout(async () => {
      const result = await services.auth.updateProfile({ kycStatus: "verified" });
      if (result.ok) setUser(result.data);
    }, VERIFY_AFTER_MS);
    return () => clearTimeout(timer);
  }, [user?.kycStatus, setUser]);

  if (!user) return null;

  if (user.kycStatus === "verified") {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success-soft">
          <BadgeCheck className="size-7 text-success" />
        </span>
        <h2 className="font-display text-lg font-bold text-content">{t("verifiedTitle")}</h2>
        <p className="max-w-sm text-[13px] text-content-tertiary">{t("verifiedHint")}</p>
      </Card>
    );
  }

  if (user.kycStatus === "pending") {
    return (
      <Card className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-warning-soft">
          <Hourglass className="size-6 animate-live text-warning" />
        </span>
        <h2 className="font-display text-lg font-bold text-content">{t("pendingTitle")}</h2>
        <p className="max-w-sm text-[13px] text-content-tertiary">{t("pendingHint")}</p>
      </Card>
    );
  }

  const submit = async () => {
    setSubmitting(true);
    const result = await services.auth.updateProfile({ kycStatus: "pending" });
    setSubmitting(false);
    if (result.ok) setUser(result.data);
  };

  const step1Valid = firstName.trim() && lastName.trim() && dob && country.trim();

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="mb-5 max-w-2xl text-[13px] leading-relaxed text-content-tertiary">{t("intro")}</p>
        <Stepper current={step} labels={[t("step1"), t("step2"), t("step3")]} />
      </Card>

      {step === 0 && (
        <Card className="p-5">
          <div className="grid max-w-lg gap-4 sm:grid-cols-2">
            <Input label={t("firstName")} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label={t("lastName")} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <Input label={t("dob")} type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            <Input label={t("country")} value={country} onChange={(e) => setCountry(e.target.value)} />
          </div>
          <Button className="mt-5" disabled={!step1Valid} onClick={() => setStep(1)}>
            {t("next")}
          </Button>
        </Card>
      )}

      {step === 1 && (
        <Card className="p-5">
          <h2 className="font-display text-base font-bold text-content">{t("docTitle")}</h2>
          <p className="mt-1 max-w-lg text-[13px] text-content-tertiary">{t("docHint")}</p>

          <p className="mt-3 flex max-w-lg items-start gap-2 rounded-lg bg-warning-soft p-3 text-xs leading-relaxed text-warning">
            <AlertTriangle className="mt-px size-3.5 shrink-0" />
            {t("demoWarning")}
          </p>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <div className="mt-4 flex items-center gap-3">
            <Button variant="secondary" onClick={() => fileInput.current?.click()}>
              <FileUp className="size-4" />
              {t("chooseFile")}
            </Button>
            {fileName ? (
              <Badge variant="success" className="normal-case tracking-normal">{fileName}</Badge>
            ) : (
              <span className="text-[13px] text-content-disabled">{t("noFile")}</span>
            )}
          </div>

          <Button className="mt-5" disabled={!fileName} loading={submitting} onClick={submit}>
            {t("submit")}
          </Button>
        </Card>
      )}
    </div>
  );
}
