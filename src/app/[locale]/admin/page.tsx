import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  Dice5,
  LifeBuoy,
  Radio,
  Timer,
  UserPlus,
  Users,
} from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatCompact } from "@/lib/format";
import type {
  AdminDashboardStats,
  SupportTicketRow,
  TransactionRow,
} from "@/lib/supabase/types";
import { requireStaff } from "@/components/admin/guard";
import { loadProfiles, loadRates } from "@/components/admin/data";
import { AdminPageHeader, Section, StatTile } from "@/components/admin/Panels";
import { EmptyRow, RowLink, Table, TableScroller, Td, Th, Tr } from "@/components/admin/Table";
import { TicketPriorityBadge, TicketStatusBadge, TxStatusBadge } from "@/components/admin/badges";
import { DASH, fmtAgo, fmtAmount, fmtDateTime, fmtUsdt, num, usdtValue } from "@/components/admin/format";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const t = await getTranslations("admin.dashboard");
  const tc = await getTranslations("admin.common");
  const ago = (value?: string | null) => fmtAgo(value, (unit, n) => tc(`ago.${unit}`, { n }));

  const profile = await requireStaff();
  if (!profile) return null;

  const supabase = await getSupabaseServerClient();

  const [statsResult, pendingResult, ticketsResult, rates] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase
      .from("transactions")
      .select("*")
      .in("status", ["pending", "processing"])
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("support_tickets")
      .select("*")
      .in("status", ["open", "pending"])
      .order("updated_at", { ascending: false })
      .limit(10),
    loadRates(supabase),
  ]);

  const stats = (statsResult.data ?? null) as AdminDashboardStats | null;
  const pending: TransactionRow[] = pendingResult.data ?? [];
  const tickets: SupportTicketRow[] = ticketsResult.data ?? [];

  const profiles = await loadProfiles(supabase, [
    ...pending.map((tx) => tx.user_id),
    ...tickets.map((ticket) => ticket.user_id),
  ]);

  const int = (value: number | undefined) => formatCompact(num(value));

  return (
    <>
      <AdminPageHeader
        title={t("title")}
        description={t("description", {
          nickname: profile.nickname,
          role: tc(`role.${profile.role}`),
        })}
      />

      {!stats ? (
        <p className="mb-6 rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-content-tertiary">
          {t("statsUnavailable", { reason: statsResult.error?.message ?? t("noData") })}
        </p>
      ) : (
        <div className="mb-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
          <StatTile
            label={t("players")}
            value={int(stats.players)}
            icon={Users}
            href="/admin/players"
          />
          <StatTile
            label={t("newToday")}
            value={int(stats.playersToday)}
            icon={UserPlus}
            tone="accent"
          />
          <StatTile
            label={t("onlineNow")}
            value={int(stats.online)}
            icon={Radio}
            hint={t("onlineHint")}
            tone="success"
          />
          <StatTile
            label={t("pendingTx")}
            value={int(stats.pendingTx)}
            icon={Timer}
            tone={num(stats.pendingTx) > 0 ? "warning" : "neutral"}
            href="/admin/transactions?status=pending"
          />
          <StatTile
            label={t("openTickets")}
            value={int(stats.openTickets)}
            icon={LifeBuoy}
            tone={num(stats.openTickets) > 0 ? "warning" : "neutral"}
            href="/admin/support"
          />
          <StatTile
            label={t("betsToday")}
            value={int(stats.betsToday)}
            icon={Dice5}
            href="/admin/bets"
          />
          <StatTile
            label={t("wageredToday")}
            value={fmtUsdt(num(stats.wageredToday))}
            hint={t("wageredHint")}
            icon={Coins}
          />
          <StatTile
            label={t("depositsWithdrawals")}
            value={`${fmtUsdt(num(stats.depositsToday))} / ${fmtUsdt(num(stats.withdrawalsToday))}`}
            hint={t("depositsHint")}
            icon={num(stats.depositsToday) >= num(stats.withdrawalsToday) ? ArrowDownToLine : ArrowUpFromLine}
          />
        </div>
      )}

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <Section
          title={t("pendingTitle")}
          description={t("pendingDescription")}
          action={
            <Link
              href="/admin/transactions?status=pending"
              className="text-[13px] font-semibold text-accent hover:underline"
            >
              {tc("viewAll")}
            </Link>
          }
        >
          <TableScroller>
            <Table minWidth="min-w-[560px]">
              <thead>
                <tr>
                  <Th>{tc("columns.player")}</Th>
                  <Th>{tc("columns.type")}</Th>
                  <Th className="text-right">{tc("columns.amount")}</Th>
                  <Th>{tc("columns.status")}</Th>
                  <Th>{tc("columns.created")}</Th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <EmptyRow colSpan={5} label={t("pendingEmpty")} />
                ) : (
                  pending.map((tx) => {
                    const player = profiles.get(tx.user_id);
                    return (
                      <Tr key={tx.id}>
                        <Td>
                          <RowLink href={`/admin/players/${tx.user_id}`}>
                            {player?.nickname ?? DASH}
                          </RowLink>
                        </Td>
                        <Td>{tc(`txType.${tx.type}`)}</Td>
                        <Td className="text-right font-semibold tabular-nums text-content">
                          {fmtAmount(tx.amount)} {tx.coin}
                          <span className="ml-1.5 text-[11px] font-normal text-content-tertiary">
                            ≈ {fmtUsdt(usdtValue(tx.coin, tx.amount, rates))} USDT
                          </span>
                        </Td>
                        <Td>
                          <TxStatusBadge status={tx.status} />
                        </Td>
                        <Td className="text-content-tertiary">{fmtDateTime(tx.created_at)}</Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableScroller>
        </Section>

        <Section
          title={t("ticketsTitle")}
          description={t("ticketsDescription")}
          action={
            <Link
              href="/admin/support"
              className="text-[13px] font-semibold text-accent hover:underline"
            >
              {t("viewInbox")}
            </Link>
          }
        >
          <TableScroller>
            <Table minWidth="min-w-[560px]">
              <thead>
                <tr>
                  <Th>{tc("columns.player")}</Th>
                  <Th>{tc("columns.subject")}</Th>
                  <Th>{tc("columns.status")}</Th>
                  <Th>{tc("columns.priority")}</Th>
                  <Th>{tc("columns.updated")}</Th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <EmptyRow colSpan={5} label={t("ticketsEmpty")} />
                ) : (
                  tickets.map((ticket) => {
                    const player = profiles.get(ticket.user_id);
                    return (
                      <Tr key={ticket.id}>
                        <Td>
                          <RowLink href="/admin/support">{player?.nickname ?? DASH}</RowLink>
                        </Td>
                        <Td className="max-w-[220px] truncate text-content">{ticket.subject}</Td>
                        <Td>
                          <TicketStatusBadge status={ticket.status} />
                        </Td>
                        <Td>
                          <TicketPriorityBadge priority={ticket.priority} />
                        </Td>
                        <Td className="text-content-tertiary">{ago(ticket.updated_at)}</Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableScroller>
        </Section>
      </div>
    </>
  );
}
