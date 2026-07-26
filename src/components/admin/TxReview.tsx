"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUiStore } from "@/stores/uiStore";
import type { DbCoin, DbTxType } from "@/lib/supabase/types";
import { ActionModal, NoteField } from "./ActionModal";
import { useErrorText } from "./errors";
import { fmtAmount } from "./format";

/**
 * Approve / reject controls for a pending deposit or withdrawal.
 * `admin_review_transaction` itself requires an admin — support operators see a
 * disabled hint instead of buttons.
 */
export function TxReview({
  txId,
  type,
  coin,
  amount,
  player,
  canReview,
}: {
  txId: string;
  type: DbTxType;
  coin: DbCoin;
  amount: string;
  player: string;
  canReview: boolean;
}) {
  const t = useTranslations("admin.transactions");
  const tc = useTranslations("admin.common");
  const errorText = useErrorText();
  const router = useRouter();
  const pushToast = useUiStore((s) => s.pushToast);
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  if (!canReview) {
    return <span className="text-xs text-content-tertiary">{tc("adminOnly")}</span>;
  }

  const submit = async (approve: boolean) => {
    try {
      const { error } = await getSupabaseBrowserClient().rpc("admin_review_transaction", {
        p_tx_id: txId,
        p_approve: approve,
        p_note: note.trim() || null,
      });
      if (error) throw error;
      pushToast("success", approve ? t("approved") : t("rejected"));
      setDialog(null);
      setNote("");
      router.refresh();
    } catch (error) {
      pushToast("error", errorText(error));
    }
  };

  const amountLabel = `${fmtAmount(amount)} ${coin}`;
  const typeLabel = tc(`txType.${type}`);
  const strong = (chunks: React.ReactNode) => <strong className="text-content">{chunks}</strong>;

  return (
    <div className="flex items-center gap-1.5">
      <Button size="xs" variant="soft" onClick={() => setDialog("approve")}>
        <Check className="size-3.5" />
        {t("approve")}
      </Button>
      <Button size="xs" variant="danger-soft" onClick={() => setDialog("reject")}>
        <X className="size-3.5" />
        {t("reject")}
      </Button>

      <ActionModal
        open={dialog === "approve"}
        onClose={() => setDialog(null)}
        title={t("approveTitle")}
        submitLabel={t("approve")}
        summary={
          <>
            {t.rich("approveSummary", {
              type: typeLabel,
              amount: amountLabel,
              player,
              b: strong,
            })}{" "}
            {type === "deposit" ? t("approveDepositHint") : t("approveWithdrawHint")}
          </>
        }
        onSubmit={() => submit(true)}
      >
        <NoteField
          label={t("reviewNote")}
          value={note}
          onValueChange={setNote}
          placeholder={t("reviewNotePlaceholder")}
        />
      </ActionModal>

      <ActionModal
        open={dialog === "reject"}
        onClose={() => setDialog(null)}
        title={t("rejectTitle")}
        submitLabel={t("reject")}
        danger
        summary={
          <>
            {t.rich("rejectSummary", {
              type: typeLabel,
              amount: amountLabel,
              player,
              b: strong,
            })}
            {type === "withdraw" && ` ${t("rejectWithdrawHint")}`}
          </>
        }
        onSubmit={() => submit(false)}
      >
        <NoteField
          label={t("reviewReason")}
          value={note}
          onValueChange={setNote}
          placeholder={t("reviewReasonPlaceholder")}
        />
      </ActionModal>
    </div>
  );
}
