"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * Two-stage modal used by every operator action: fill the form, read a plain
 * summary of what is about to happen, then confirm. Nothing that moves money or
 * changes an account state is a single click.
 */
export function ActionModal({
  open,
  onClose,
  title,
  submitLabel,
  summary,
  danger,
  disabled,
  error,
  onSubmit,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  submitLabel: string;
  /** Human sentence describing the pending change, shown on the confirm step. */
  summary: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  /** Inline failure text, shown on both stages so it survives the confirm step. */
  error?: string | null;
  onSubmit: () => Promise<void>;
  children: React.ReactNode;
}) {
  const t = useTranslations("admin.common");
  const [stage, setStage] = useState<"form" | "confirm">("form");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (open) {
      setStage("form");
      setPending(false);
    }
  }, [open]);

  const close = () => {
    if (!pending) onClose();
  };

  return (
    <Modal open={open} onClose={close} title={title}>
      {stage === "form" ? (
        <div className="flex flex-col gap-4">
          {children}
          {error && (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={close}>
              {t("cancel")}
            </Button>
            <Button size="sm" disabled={disabled} onClick={() => setStage("confirm")}>
              {t("continue")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3",
              danger ? "border-danger/40 bg-danger-soft" : "border-line-strong bg-surface-2",
            )}
          >
            <AlertTriangle
              className={cn("mt-0.5 size-4 shrink-0", danger ? "text-danger" : "text-warning")}
            />
            <div className="min-w-0 text-[13px] leading-relaxed text-content">{summary}</div>
          </div>
          {error && (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => setStage("form")}>
              {t("back")}
            </Button>
            <Button
              size="sm"
              variant={danger ? "danger" : "primary"}
              loading={pending}
              onClick={async () => {
                setPending(true);
                try {
                  await onSubmit();
                } finally {
                  setPending(false);
                }
              }}
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/** Multi-line text field matching the Input primitive's styling. */
export function NoteField({
  label,
  value,
  onValueChange,
  placeholder,
  rows = 3,
  maxLength = 500,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      <span className="text-[13px] font-medium text-content-secondary">{label}</span>
      <textarea
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full resize-y rounded-md border border-line-strong bg-surface-2 px-3 py-2 text-sm text-content outline-none transition-colors duration-120 placeholder:text-content-disabled hover:border-graphite-500 focus:border-accent focus:ring-2 focus:ring-accent-soft"
      />
    </label>
  );
}
