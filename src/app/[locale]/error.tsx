"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("common");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-danger-soft">
        <AlertTriangle className="size-6 text-danger" />
      </span>
      <h1 className="font-display text-xl font-bold text-content">{t("error")}</h1>
      <p className="mt-2 max-w-[420px] text-sm text-content-tertiary">{t("errorDescription")}</p>
      <Button className="mt-6" onClick={reset}>
        {t("retry")}
      </Button>
    </div>
  );
}
