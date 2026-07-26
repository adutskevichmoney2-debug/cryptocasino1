import { Badge } from "@/components/ui/Badge";
import type {
  AccountStatus,
  DbBetStatus,
  DbTxStatus,
  DbTxType,
  KycStatus,
  TicketPriority,
  TicketStatus,
  UserRole,
} from "@/lib/supabase/types";
import { humanize } from "./format";

type Variant = "neutral" | "accent" | "success" | "danger" | "warning" | "outline";

const ACCOUNT_STATUS: Record<AccountStatus, Variant> = {
  active: "success",
  frozen: "warning",
  self_excluded: "outline",
  banned: "danger",
};

const KYC: Record<KycStatus, Variant> = {
  none: "neutral",
  pending: "warning",
  verified: "success",
  rejected: "danger",
};

const ROLE: Record<UserRole, Variant> = {
  player: "neutral",
  support: "accent",
  admin: "warning",
};

const TX_STATUS: Record<DbTxStatus, Variant> = {
  pending: "warning",
  processing: "warning",
  confirmed: "success",
  rejected: "danger",
  failed: "danger",
};

const BET_STATUS: Record<DbBetStatus, Variant> = {
  open: "accent",
  won: "success",
  lost: "danger",
  void: "neutral",
  cashed_out: "outline",
};

const TICKET_STATUS: Record<TicketStatus, Variant> = {
  open: "accent",
  pending: "warning",
  resolved: "success",
  closed: "neutral",
};

const TICKET_PRIORITY: Record<TicketPriority, Variant> = {
  low: "neutral",
  normal: "outline",
  high: "warning",
  urgent: "danger",
};

/** Credit-side transaction types render green in amount cells. */
export const CREDIT_TYPES: DbTxType[] = ["deposit", "win", "bonus", "rollback"];

export function StatusBadge({ status }: { status: AccountStatus }) {
  return <Badge variant={ACCOUNT_STATUS[status]}>{humanize(status)}</Badge>;
}

export function KycBadge({ status }: { status: KycStatus }) {
  return <Badge variant={KYC[status]}>KYC {status}</Badge>;
}

export function RoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={ROLE[role]}>{role}</Badge>;
}

export function TxStatusBadge({ status }: { status: DbTxStatus }) {
  return <Badge variant={TX_STATUS[status]}>{status}</Badge>;
}

export function BetStatusBadge({ status }: { status: DbBetStatus }) {
  return <Badge variant={BET_STATUS[status]}>{humanize(status)}</Badge>;
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={TICKET_STATUS[status]}>{status}</Badge>;
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge variant={TICKET_PRIORITY[priority]}>{priority}</Badge>;
}
