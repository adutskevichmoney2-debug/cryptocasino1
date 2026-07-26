"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/cn";

export function CopyField({
  value,
  display,
  className,
}: {
  value: string;
  /** Optional shortened representation; full value is still copied. */
  display?: string;
  className?: string;
}) {
  const { copied, copy } = useCopyToClipboard();
  const t = useTranslations("common");

  return (
    <div
      className={cn(
        "flex h-10 items-center gap-2 rounded-md border border-line-strong bg-surface-2 pl-3 pr-1.5",
        className,
      )}
    >
      <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-content">
        {display ?? value}
      </span>
      <button
        type="button"
        onClick={() => void copy(value)}
        aria-label={copied ? t("copied") : t("copy")}
        className={cn(
          "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-120",
          copied ? "bg-success-soft text-success" : "text-content-tertiary hover:bg-surface-3 hover:text-content",
        )}
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
}
