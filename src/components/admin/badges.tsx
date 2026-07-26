import { useTranslations } from "next-intl";
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

/**
 * `useTranslations` works in both Server and Client Components, so these badges
 * stay usable from the async list pages and from the realtime support inbox.
 */
export function StatusBadge({ status }: { status: AccountStatus }) {
  const t = useTranslations("admin.common");
  return <Badge variant={ACCOUNT_STATUS[status]}>{t(`status.${status}`)}</Badge>;
}

export function KycBadge({ status }: { status: KycStatus }) {
  const t = useTranslations("admin.common");
  return <Badge variant={KYC[status]}>{t(`kycBadge.${status}`)}</Badge>;
}

export function RoleBadge({ role }: { role: UserRole }) {
  const t = useTranslations("admin.common");
  return <Badge variant={ROLE[role]}>{t(`role.${role}`)}</Badge>;
}

export function TxStatusBadge({ status }: { status: DbTxStatus }) {
  const t = useTranslations("admin.common");
  return <Badge variant={TX_STATUS[status]}>{t(`txStatus.${status}`)}</Badge>;
}

export function BetStatusBadge({ status }: { status: DbBetStatus }) {
  const t = useTranslations("admin.common");
  return <Badge variant={BET_STATUS[status]}>{t(`betStatus.${status}`)}</Badge>;
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const t = useTranslations("admin.common");
  return <Badge variant={TICKET_STATUS[status]}>{t(`ticketStatus.${status}`)}</Badge>;
}

export function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const t = useTranslations("admin.common");
  return <Badge variant={TICKET_PRIORITY[priority]}>{t(`ticketPriority.${priority}`)}</Badge>;
}
