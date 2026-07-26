"use client";

import { useState } from "react";
import { KeyRound, NotebookPen, ShieldCheck, SlidersHorizontal, Wallet } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUiStore } from "@/stores/uiStore";
import type {
  AccountStatus,
  DbCoin,
  KycStatus,
  UserRole,
} from "@/lib/supabase/types";
import { ActionModal, NoteField } from "./ActionModal";
import { errorText } from "./errors";
import { fmtAmount } from "./format";

const COINS: DbCoin[] = ["BTC", "ETH", "USDT", "USDC", "TRX", "SOL", "LTC", "DOGE"];
const ACCOUNT_STATUSES: AccountStatus[] = ["active", "frozen", "self_excluded", "banned"];
const KYC_STATUSES: KycStatus[] = ["none", "pending", "verified", "rejected"];
const ROLES: UserRole[] = ["player", "support", "admin"];

const asOptions = (values: readonly string[]) => values.map((v) => ({ value: v, label: v }));

type Dialog = "balance" | "status" | "kyc" | "role" | null;

export function PlayerActions({
  userId,
  nickname,
  status,
  kycStatus,
  role,
  note,
  viewerRole,
  viewerId,
}: {
  userId: string;
  nickname: string;
  status: AccountStatus;
  kycStatus: KycStatus;
  role: UserRole;
  note: string | null;
  viewerRole: UserRole;
  viewerId: string;
}) {
  const router = useRouter();
  const pushToast = useUiStore((s) => s.pushToast);
  const [dialog, setDialog] = useState<Dialog>(null);

  const isAdmin = viewerRole === "admin";
  const isSelf = viewerId === userId;

  // Balance adjustment
  const [coin, setCoin] = useState<DbCoin>("USDT");
  const [amount, setAmount] = useState("");
  const [balanceNote, setBalanceNote] = useState("");

  // Status / KYC / role
  const [nextStatus, setNextStatus] = useState<AccountStatus>(status);
  const [statusReason, setStatusReason] = useState("");
  const [nextKyc, setNextKyc] = useState<KycStatus>(kycStatus);
  const [kycReason, setKycReason] = useState("");
  const [nextRole, setNextRole] = useState<UserRole>(role);

  // Internal note
  const [internalNote, setInternalNote] = useState(note ?? "");
  const [savingNote, setSavingNote] = useState(false);

  const amountValue = Number(amount);
  const amountValid = amount.trim() !== "" && Number.isFinite(amountValue) && amountValue !== 0;

  // PostgREST builders are thenable but not real Promises, so PromiseLike it is.
  const run = async (fn: () => PromiseLike<{ error: { message: string } | null }>, ok: string) => {
    try {
      const { error } = await fn();
      if (error) throw error;
      pushToast("success", ok);
      setDialog(null);
      router.refresh();
    } catch (error) {
      pushToast("error", errorText(error));
    }
  };

  const supabase = () => getSupabaseBrowserClient();

  return (
    <Card className="p-4">
      <h2 className="font-display text-[15px] font-bold text-content">Actions</h2>
      <p className="mt-0.5 text-xs text-content-tertiary">
        Every action is written to the audit log with your operator id.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {isAdmin && (
          <Button size="sm" variant="secondary" onClick={() => setDialog("balance")}>
            <Wallet className="size-4" />
            Adjust balance
          </Button>
        )}
        {isAdmin && !isSelf && (
          <Button size="sm" variant="secondary" onClick={() => setDialog("status")}>
            <SlidersHorizontal className="size-4" />
            Account status
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => setDialog("kyc")}>
          <ShieldCheck className="size-4" />
          KYC status
        </Button>
        {isAdmin && !isSelf && (
          <Button size="sm" variant="secondary" onClick={() => setDialog("role")}>
            <KeyRound className="size-4" />
            Change role
          </Button>
        )}
      </div>

      {!isAdmin && (
        <p className="mt-2.5 text-xs text-content-tertiary">
          Balance, account status and role changes require an admin account.
        </p>
      )}

      <div className="mt-4 border-t border-line pt-4">
        <NoteField
          label="Internal note"
          value={internalNote}
          onValueChange={setInternalNote}
          placeholder="Visible to staff only"
          rows={4}
          maxLength={2000}
        />
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            loading={savingNote}
            disabled={internalNote === (note ?? "")}
            onClick={async () => {
              setSavingNote(true);
              try {
                const { error } = await supabase().rpc("admin_add_note", {
                  p_user_id: userId,
                  p_note: internalNote,
                });
                if (error) throw error;
                pushToast("success", "Internal note saved.");
                router.refresh();
              } catch (error) {
                pushToast("error", errorText(error));
              } finally {
                setSavingNote(false);
              }
            }}
          >
            <NotebookPen className="size-4" />
            Save note
          </Button>
        </div>
      </div>

      {/* ── Adjust balance ─────────────────────────────────────────────── */}
      <ActionModal
        open={dialog === "balance"}
        onClose={() => setDialog(null)}
        title="Adjust balance"
        submitLabel="Apply adjustment"
        danger={amountValue < 0}
        disabled={!amountValid}
        summary={
          <>
            {amountValue > 0 ? "Credit" : "Debit"}{" "}
            <strong className="text-content">
              {fmtAmount(Math.abs(amountValue))} {coin}
            </strong>{" "}
            {amountValue > 0 ? "to" : "from"} <strong className="text-content">{nickname}</strong>.
            An <code className="font-mono text-xs">adjustment</code> transaction is written to the
            ledger and the player is notified.
          </>
        }
        onSubmit={() =>
          run(
            () =>
              supabase().rpc("admin_adjust_balance", {
                p_user_id: userId,
                p_coin: coin,
                p_amount: amountValue,
                p_note: balanceNote.trim() || null,
              }),
            `Balance adjusted by ${fmtAmount(amountValue)} ${coin}.`,
          )
        }
      >
        <Select
          label="Coin"
          options={asOptions(COINS)}
          value={coin}
          onChange={(e) => setCoin(e.target.value as DbCoin)}
        />
        <Input
          label="Signed amount"
          inputMode="decimal"
          placeholder="e.g. 25 or -10.5"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          hint="Positive credits the account, negative debits it."
        />
        <NoteField
          label="Note (optional)"
          value={balanceNote}
          onValueChange={setBalanceNote}
          placeholder="Reason for the adjustment"
        />
      </ActionModal>

      {/* ── Account status ─────────────────────────────────────────────── */}
      <ActionModal
        open={dialog === "status"}
        onClose={() => setDialog(null)}
        title="Change account status"
        submitLabel="Change status"
        danger={nextStatus === "banned" || nextStatus === "frozen"}
        disabled={nextStatus === status}
        summary={
          <>
            Set <strong className="text-content">{nickname}</strong> from{" "}
            <strong className="text-content">{status}</strong> to{" "}
            <strong className="text-content">{nextStatus}</strong>.
            {nextStatus !== "active" && " The player will be blocked from betting and depositing."}
          </>
        }
        onSubmit={() =>
          run(
            () =>
              supabase().rpc("admin_set_account_status", {
                p_user_id: userId,
                p_status: nextStatus,
                p_reason: statusReason.trim() || null,
              }),
            `Account status set to ${nextStatus}.`,
          )
        }
      >
        <Select
          label="Status"
          options={asOptions(ACCOUNT_STATUSES)}
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value as AccountStatus)}
        />
        <NoteField
          label="Reason"
          value={statusReason}
          onValueChange={setStatusReason}
          placeholder="Stored on the profile and in the audit log"
        />
      </ActionModal>

      {/* ── KYC status ─────────────────────────────────────────────────── */}
      <ActionModal
        open={dialog === "kyc"}
        onClose={() => setDialog(null)}
        title="Change KYC status"
        submitLabel="Change KYC"
        danger={nextKyc === "rejected"}
        disabled={nextKyc === kycStatus}
        summary={
          <>
            Set KYC for <strong className="text-content">{nickname}</strong> from{" "}
            <strong className="text-content">{kycStatus}</strong> to{" "}
            <strong className="text-content">{nextKyc}</strong>. The player receives a
            notification.
          </>
        }
        onSubmit={() =>
          run(
            () =>
              supabase().rpc("admin_set_kyc_status", {
                p_user_id: userId,
                p_status: nextKyc,
                p_reason: kycReason.trim() || null,
              }),
            `KYC status set to ${nextKyc}.`,
          )
        }
      >
        <Select
          label="KYC status"
          options={asOptions(KYC_STATUSES)}
          value={nextKyc}
          onChange={(e) => setNextKyc(e.target.value as KycStatus)}
        />
        <NoteField
          label="Reason"
          value={kycReason}
          onValueChange={setKycReason}
          placeholder="Why the decision was taken"
        />
      </ActionModal>

      {/* ── Role ───────────────────────────────────────────────────────── */}
      <ActionModal
        open={dialog === "role"}
        onClose={() => setDialog(null)}
        title="Change role"
        submitLabel="Change role"
        danger={nextRole === "admin"}
        disabled={nextRole === role}
        summary={
          <>
            Change <strong className="text-content">{nickname}</strong> from{" "}
            <strong className="text-content">{role}</strong> to{" "}
            <strong className="text-content">{nextRole}</strong>.
            {nextRole !== "player" && " This grants access to the operator panel."}
          </>
        }
        onSubmit={() =>
          run(
            () => supabase().rpc("admin_set_role", { p_user_id: userId, p_role: nextRole }),
            `Role set to ${nextRole}.`,
          )
        }
      >
        <Select
          label="Role"
          options={asOptions(ROLES)}
          value={nextRole}
          onChange={(e) => setNextRole(e.target.value as UserRole)}
        />
      </ActionModal>
    </Card>
  );
}
