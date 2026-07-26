"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Hash, KeyRound, NotebookPen, ShieldCheck, SlidersHorizontal, Wallet } from "lucide-react";
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
import { KycBadge, RoleBadge, StatusBadge } from "./badges";
import { useErrorText } from "./errors";
import { fmtAmount } from "./format";

const COINS: DbCoin[] = ["BTC", "ETH", "USDT", "USDC", "TRX", "SOL", "LTC", "DOGE"];
const ACCOUNT_STATUSES: AccountStatus[] = ["active", "frozen", "self_excluded", "banned"];
const KYC_STATUSES: KycStatus[] = ["none", "pending", "verified", "rejected"];
const ROLES: UserRole[] = ["player", "support", "admin"];

/** Public account numbers are 4–12 digits, matching admin_set_player_id. */
const PLAYER_ID_RE = /^\d{4,12}$/;

type Dialog = "balance" | "status" | "kyc" | "role" | "playerId" | null;

export function PlayerActions({
  userId,
  playerId,
  nickname,
  status,
  kycStatus,
  role,
  note,
  viewerRole,
  viewerId,
}: {
  userId: string;
  playerId: number;
  nickname: string;
  status: AccountStatus;
  kycStatus: KycStatus;
  role: UserRole;
  note: string | null;
  viewerRole: UserRole;
  viewerId: string;
}) {
  const t = useTranslations("admin.player");
  const tc = useTranslations("admin.common");
  const errorText = useErrorText();
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

  // Public player id
  const [nextPlayerId, setNextPlayerId] = useState(String(playerId));
  const [playerIdError, setPlayerIdError] = useState<string | null>(null);

  // Internal note
  const [internalNote, setInternalNote] = useState(note ?? "");
  const [savingNote, setSavingNote] = useState(false);

  const amountValue = Number(amount);
  const amountValid = amount.trim() !== "" && Number.isFinite(amountValue) && amountValue !== 0;

  const trimmedPlayerId = nextPlayerId.trim();
  const playerIdFormatValid = PLAYER_ID_RE.test(trimmedPlayerId);
  const playerIdChanged = playerIdFormatValid && Number(trimmedPlayerId) !== playerId;

  const strong = (chunks: React.ReactNode) => <strong className="text-content">{chunks}</strong>;
  const code = (chunks: React.ReactNode) => <code className="font-mono text-xs">{chunks}</code>;

  /** The option the account is on today is spelled out so it is never ambiguous. */
  const withCurrent = (label: string, isCurrent: boolean) =>
    isCurrent ? t("statusOptionCurrent", { label }) : label;

  const statusOptions = ACCOUNT_STATUSES.map((v) => ({
    value: v,
    label: withCurrent(tc(`status.${v}`), v === status),
  }));
  const kycOptions = KYC_STATUSES.map((v) => ({
    value: v,
    label: withCurrent(tc(`kyc.${v}`), v === kycStatus),
  }));
  const roleOptions = ROLES.map((v) => ({
    value: v,
    label: withCurrent(tc(`role.${v}`), v === role),
  }));
  const coinOptions = COINS.map((v) => ({ value: v, label: v }));

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

  /**
   * Player id gets its own submit: the RPC's raised codes are surfaced inline in
   * the dialog as well as through the usual error toast.
   */
  const submitPlayerId = async () => {
    setPlayerIdError(null);
    if (!playerIdFormatValid) {
      const message = tc("errors.player_id_invalid");
      setPlayerIdError(message);
      pushToast("error", message);
      return;
    }
    try {
      const { error } = await supabase().rpc("admin_set_player_id", {
        p_user_id: userId,
        p_player_id: Number(trimmedPlayerId),
      });
      if (error) throw error;
      pushToast("success", t("playerIdDone", { id: trimmedPlayerId }));
      setDialog(null);
      router.refresh();
    } catch (error) {
      // player_id_taken / player_id_invalid / forbidden all have translated text.
      const message = errorText(error);
      setPlayerIdError(message);
      pushToast("error", message);
    }
  };

  /**
   * Re-seed the form from the freshest props every time a dialog opens, so a
   * router.refresh() (or a change made by another operator) can never leave a
   * stale "next" value selected.
   */
  const openDialog = (next: Dialog) => {
    if (next === "status") setNextStatus(status);
    if (next === "kyc") setNextKyc(kycStatus);
    if (next === "role") setNextRole(role);
    if (next === "playerId") {
      setNextPlayerId(String(playerId));
      setPlayerIdError(null);
    }
    setDialog(next);
  };

  return (
    <Card className="p-4">
      <h2 className="font-display text-[15px] font-bold text-content">{t("actionsTitle")}</h2>
      <p className="mt-0.5 text-xs text-content-tertiary">{t("actionsHint")}</p>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-content-tertiary">
        <span>{t("statusCurrent")}:</span>
        <StatusBadge status={status} />
        <KycBadge status={kycStatus} />
        <RoleBadge role={role} />
        <span className="font-mono">#{playerId}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isAdmin && (
          <Button size="sm" variant="secondary" onClick={() => openDialog("balance")}>
            <Wallet className="size-4" />
            {t("balanceAction")}
          </Button>
        )}
        {isAdmin && !isSelf && (
          <Button size="sm" variant="secondary" onClick={() => openDialog("status")}>
            <SlidersHorizontal className="size-4" />
            {t("statusAction")}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => openDialog("kyc")}>
          <ShieldCheck className="size-4" />
          {t("kycAction")}
        </Button>
        {isAdmin && !isSelf && (
          <Button size="sm" variant="secondary" onClick={() => openDialog("role")}>
            <KeyRound className="size-4" />
            {t("roleAction")}
          </Button>
        )}
        {isAdmin && (
          <Button size="sm" variant="secondary" onClick={() => openDialog("playerId")}>
            <Hash className="size-4" />
            {t("playerIdAction")}
          </Button>
        )}
      </div>

      {!isAdmin && <p className="mt-2.5 text-xs text-content-tertiary">{t("adminRequired")}</p>}

      <div className="mt-4 border-t border-line pt-4">
        <NoteField
          label={t("noteLabel")}
          value={internalNote}
          onValueChange={setInternalNote}
          placeholder={t("notePlaceholder")}
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
                pushToast("success", t("noteSaved"));
                router.refresh();
              } catch (error) {
                pushToast("error", errorText(error));
              } finally {
                setSavingNote(false);
              }
            }}
          >
            <NotebookPen className="size-4" />
            {t("noteSave")}
          </Button>
        </div>
      </div>

      {/* ── Adjust balance ─────────────────────────────────────────────── */}
      <ActionModal
        open={dialog === "balance"}
        onClose={() => setDialog(null)}
        title={t("balanceTitle")}
        submitLabel={t("balanceSubmit")}
        danger={amountValue < 0}
        disabled={!amountValid}
        summary={t.rich(amountValue > 0 ? "balanceSummaryCredit" : "balanceSummaryDebit", {
          amount: `${fmtAmount(Math.abs(amountValue))} ${coin}`,
          nickname,
          b: strong,
          code,
        })}
        onSubmit={() =>
          run(
            () =>
              supabase().rpc("admin_adjust_balance", {
                p_user_id: userId,
                p_coin: coin,
                p_amount: amountValue,
                p_note: balanceNote.trim() || null,
              }),
            t("balanceDone", { amount: `${fmtAmount(amountValue)} ${coin}` }),
          )
        }
      >
        <Select
          label={t("balanceCoin")}
          options={coinOptions}
          value={coin}
          onChange={(e) => setCoin(e.target.value as DbCoin)}
        />
        <Input
          label={t("balanceAmount")}
          inputMode="decimal"
          placeholder={t("balanceAmountPlaceholder")}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          hint={t("balanceAmountHint")}
        />
        <NoteField
          label={t("balanceNote")}
          value={balanceNote}
          onValueChange={setBalanceNote}
          placeholder={t("balanceNotePlaceholder")}
        />
      </ActionModal>

      {/* ── Account status ─────────────────────────────────────────────── */}
      <ActionModal
        open={dialog === "status"}
        onClose={() => setDialog(null)}
        title={t("statusTitle")}
        submitLabel={t("statusSubmit")}
        danger={nextStatus === "banned" || nextStatus === "frozen"}
        disabled={nextStatus === status}
        summary={
          <>
            {t.rich("statusSummary", {
              nickname,
              from: tc(`status.${status}`),
              to: tc(`status.${nextStatus}`),
              b: strong,
            })}{" "}
            {nextStatus === "active" ? t("statusSummaryUnblock") : t("statusSummaryBlock")}
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
            t("statusDone", { status: tc(`status.${nextStatus}`) }),
          )
        }
      >
        <div className="flex items-center gap-2 text-xs text-content-tertiary">
          <span>{t("statusCurrent")}:</span>
          <StatusBadge status={status} />
        </div>
        <Select
          label={t("statusLabel")}
          options={statusOptions}
          value={nextStatus}
          onChange={(e) => setNextStatus(e.target.value as AccountStatus)}
        />
        <NoteField
          label={t("statusReasonLabel")}
          value={statusReason}
          onValueChange={setStatusReason}
          placeholder={t("statusReasonPlaceholder")}
        />
      </ActionModal>

      {/* ── KYC status ─────────────────────────────────────────────────── */}
      <ActionModal
        open={dialog === "kyc"}
        onClose={() => setDialog(null)}
        title={t("kycTitle")}
        submitLabel={t("kycSubmit")}
        danger={nextKyc === "rejected"}
        disabled={nextKyc === kycStatus}
        summary={t.rich("kycSummary", {
          nickname,
          from: tc(`kyc.${kycStatus}`),
          to: tc(`kyc.${nextKyc}`),
          b: strong,
        })}
        onSubmit={() =>
          run(
            () =>
              supabase().rpc("admin_set_kyc_status", {
                p_user_id: userId,
                p_status: nextKyc,
                p_reason: kycReason.trim() || null,
              }),
            t("kycDone", { status: tc(`kyc.${nextKyc}`) }),
          )
        }
      >
        <div className="flex items-center gap-2 text-xs text-content-tertiary">
          <span>{t("kycCurrent")}:</span>
          <KycBadge status={kycStatus} />
        </div>
        <Select
          label={t("kycLabel")}
          options={kycOptions}
          value={nextKyc}
          onChange={(e) => setNextKyc(e.target.value as KycStatus)}
        />
        <NoteField
          label={t("kycReasonLabel")}
          value={kycReason}
          onValueChange={setKycReason}
          placeholder={t("kycReasonPlaceholder")}
        />
      </ActionModal>

      {/* ── Role ───────────────────────────────────────────────────────── */}
      <ActionModal
        open={dialog === "role"}
        onClose={() => setDialog(null)}
        title={t("roleTitle")}
        submitLabel={t("roleSubmit")}
        danger={nextRole === "admin"}
        disabled={nextRole === role}
        summary={
          <>
            {t.rich("roleSummary", {
              nickname,
              from: tc(`role.${role}`),
              to: tc(`role.${nextRole}`),
              b: strong,
            })}{" "}
            {nextRole === "player" ? t("roleSummaryRevoke") : t("roleSummaryGrant")}
          </>
        }
        onSubmit={() =>
          run(
            () => supabase().rpc("admin_set_role", { p_user_id: userId, p_role: nextRole }),
            t("roleDone", { role: tc(`role.${nextRole}`) }),
          )
        }
      >
        <div className="flex items-center gap-2 text-xs text-content-tertiary">
          <span>{t("roleCurrent")}:</span>
          <RoleBadge role={role} />
        </div>
        <Select
          label={t("roleLabel")}
          options={roleOptions}
          value={nextRole}
          onChange={(e) => setNextRole(e.target.value as UserRole)}
        />
      </ActionModal>

      {/* ── Public player id ───────────────────────────────────────────── */}
      <ActionModal
        open={dialog === "playerId"}
        onClose={() => setDialog(null)}
        title={t("playerIdTitle")}
        submitLabel={t("playerIdSubmit")}
        disabled={!playerIdChanged}
        error={playerIdError}
        summary={t.rich("playerIdSummary", {
          nickname,
          from: `#${playerId}`,
          to: `#${trimmedPlayerId}`,
          b: strong,
        })}
        onSubmit={submitPlayerId}
      >
        <div className="flex items-center gap-2 text-xs text-content-tertiary">
          <span>{t("playerIdCurrent")}:</span>
          <span className="font-mono text-content">#{playerId}</span>
        </div>
        <Input
          label={t("playerIdLabel")}
          inputMode="numeric"
          pattern="\d*"
          maxLength={12}
          placeholder={t("playerIdPlaceholder")}
          value={nextPlayerId}
          onChange={(e) => {
            setNextPlayerId(e.target.value.replace(/\D/g, ""));
            setPlayerIdError(null);
          }}
          error={
            trimmedPlayerId !== "" && !playerIdFormatValid
              ? tc("errors.player_id_invalid")
              : undefined
          }
          hint={t("playerIdHint")}
        />
        {playerIdFormatValid && !playerIdChanged && (
          <p className="text-xs text-content-tertiary">{t("playerIdSame")}</p>
        )}
      </ActionModal>
    </Card>
  );
}
