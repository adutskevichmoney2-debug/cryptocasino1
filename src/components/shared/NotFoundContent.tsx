"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";

export function NotFoundContent() {
  const t = useTranslations("notFound");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <svg viewBox="0 0 120 120" className="mb-6 size-28" aria-hidden="true">
        <defs>
          <linearGradient id="nf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1f2630" />
            <stop offset="1" stopColor="#12161d" />
          </linearGradient>
        </defs>
        <rect x="14" y="14" width="92" height="92" rx="22" fill="url(#nf)" stroke="#2a3340" />
        <circle cx="42" cy="42" r="7" fill="#10b981" />
        <circle cx="78" cy="78" r="7" fill="#10b981" />
        <circle cx="60" cy="60" r="7" fill="#3a4452" />
        <circle cx="78" cy="42" r="7" fill="#3a4452" />
        <circle cx="42" cy="78" r="7" fill="#3a4452" />
      </svg>
      <p className="font-display text-5xl font-extrabold text-content">404</p>
      <h1 className="mt-3 font-display text-xl font-bold text-content">{t("title")}</h1>
      <p className="mt-2 max-w-[420px] text-sm text-content-tertiary">{t("description")}</p>
      <Link href="/casino" className="mt-6">
        <Button>{t("backToCasino")}</Button>
      </Link>
    </div>
  );
}
