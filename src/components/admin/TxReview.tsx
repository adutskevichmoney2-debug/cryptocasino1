"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUiStore } from "@/stores/uiStore";
import type { DbCoin, DbTxType } from "@/lib/supabase/types";
import { ActionModal, NoteField } from "./ActionModal";
import { errorText } from "./errors";
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
  const router = useRouter();
  const pushToast = useUiStore((s) => s.pushToast);
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  if (!canReview) {
    return <span className="text-xs text-content-tertiary">Admin only</span>;
  }

  const submit = async (approve: boolean) => {
    try {
      const { error } = await getSupabaseBrowserClient().rpc("admin_review_transaction", {
        p_tx_id: txId,
        p_approve: approve,
        p_note: note.trim() || null,
      });
      if (error) throw error;
      pushToast("success", approve ? "Transaction approved." : "Transaction rejected.");
      setDialog(null);
      setNote("");
      router.refresh();
    } catch (error) {
      pushToast("error", errorText(error));
    }
  };

  const amountLabel = `${fmtAmount(amount)} ${coin}`;

  return (
    <div className="flex items-center gap-1.5">
      <Button size="xs" variant="soft" onClick={() => setDialog("approve")}>
        <Check className="size-3.5" />
        Approve
      </Button>
      <Button size="xs" variant="danger-soft" onClick={() => setDialog("reject")}>
        <X className="size-3.5" />
        Reject
      </Button>

      <ActionModal
        open={dialog === "approve"}
        onClose={() => setDialog(null)}
        title="Approve transaction"
        submitLabel="Approve"
        summary={
          <>
            Approve the {type} of <strong className="text-content">{amountLabel}</strong> for{" "}
            <strong className="text-content">{player}</strong>.
            {type === "deposit"
              ? " The amount is credited to the player's balance immediately."
              : " The funds were already reserved when the request was made."}
          </>
        }
        onSubmit={() => submit(true)}
      >
        <NoteField
          label="Note (optional)"
          value={note}
          onValueChange={setNote}
          placeholder="Visible on the transaction record"
        />
      </ActionModal>

      <ActionModal
        open={dialog === "reject"}
        onClose={() => setDialog(null)}
        title="Reject transaction"
        submitLabel="Reject"
        danger
        summary={
          <>
            Reject the {type} of <strong className="text-content">{amountLabel}</strong> for{" "}
            <strong className="text-content">{player}</strong>.
            {type === "withdraw" && " The reserved funds are returned to the player's balance."}
          </>
        }
        onSubmit={() => submit(false)}
      >
        <NoteField
          label="Reason (optional)"
          value={note}
          onValueChange={setNote}
          placeholder="Stored on the transaction and in the audit log"
        />
      </ActionModal>
    </div>
  );
}
