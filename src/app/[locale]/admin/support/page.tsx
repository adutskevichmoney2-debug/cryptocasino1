import { getTranslations, setRequestLocale } from "next-intl/server";
import { LifeBuoy } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import type { SupportTicketRow, TicketPriority, TicketStatus } from "@/lib/supabase/types";
import { requireStaff } from "@/components/admin/guard";
import { loadProfiles } from "@/components/admin/data";
import { AdminPageHeader } from "@/components/admin/Panels";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { SupportInbox, type AdminTicket } from "@/components/admin/SupportInbox";
import { param, type RawSearchParams } from "@/components/admin/query";

const BASE_PATH = "/admin/support";
const INBOX_LIMIT = 100;

const STATUSES: TicketStatus[] = ["open", "pending", "resolved", "closed"];
const PRIORITIES: TicketPriority[] = ["low", "normal", "high", "urgent"];

export default async function AdminSupportPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("admin.support");
  const tc = await getTranslations("admin.common");

  const viewer = await requireStaff();
  if (!viewer) return null;

  const sp = await searchParams;
  const status = param(sp, "status");
  const priority = param(sp, "priority");

  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("support_tickets")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(INBOX_LIMIT);

  if (status) query = query.eq("status", status as TicketStatus);
  else query = query.in("status", ["open", "pending"]);
  if (priority) query = query.eq("priority", priority as TicketPriority);

  const { data, error } = await query;
  const rows: SupportTicketRow[] = data ?? [];

  const profiles = await loadProfiles(supabase, [
    ...rows.map((ticket) => ticket.user_id),
    ...rows.map((ticket) => ticket.assigned_to),
  ]);

  // avatar_id is not part of the mini projection — fetch it for the list rows.
  const avatars = new Map<string, number>();
  if (rows.length > 0) {
    const { data: avatarRows } = await supabase
      .from("profiles")
      .select("id, avatar_id")
      .in(
        "id",
        rows.map((ticket) => ticket.user_id),
      );
    for (const row of avatarRows ?? []) avatars.set(row.id, row.avatar_id);
  }

  const tickets: AdminTicket[] = rows.map((ticket) => {
    const player = profiles.get(ticket.user_id);
    return {
      id: ticket.id,
      user_id: ticket.user_id,
      subject: ticket.subject,
      topic: ticket.topic,
      status: ticket.status,
      priority: ticket.priority,
      assigned_to: ticket.assigned_to,
      created_at: ticket.created_at,
      updated_at: ticket.updated_at,
      playerNickname: player?.nickname ?? t("unknownPlayer"),
      playerNumber: player?.player_id ?? null,
      playerAvatarId: avatars.get(ticket.user_id) ?? 0,
      assigneeNickname: ticket.assigned_to
        ? (profiles.get(ticket.assigned_to)?.nickname ?? null)
        : null,
    };
  });

  return (
    <>
      <AdminPageHeader
        title={t("title")}
        description={t("description", { limit: INBOX_LIMIT })}
      />

      <AdminFilters
        basePath={BASE_PATH}
        values={{ status, priority }}
        selects={[
          {
            name: "status",
            label: tc("columns.status"),
            options: [
              { value: "", label: tc("openAndPending") },
              ...STATUSES.map((v) => ({ value: v, label: tc(`ticketStatus.${v}`) })),
            ],
          },
          {
            name: "priority",
            label: tc("columns.priority"),
            options: [
              { value: "", label: tc("allPriorities") },
              ...PRIORITIES.map((v) => ({ value: v, label: tc(`ticketPriority.${v}`) })),
            ],
          },
        ]}
      />

      {error ? (
        <EmptyState icon={LifeBuoy} title={t("loadError")} description={error.message} />
      ) : (
        <SupportInbox
          initialTickets={tickets}
          viewerId={viewer.id}
          viewerNickname={viewer.nickname}
        />
      )}
    </>
  );
}
