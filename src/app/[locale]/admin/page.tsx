import { setRequestLocale } from "next-intl/server";
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
import { loadProfiles } from "@/components/admin/data";
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

  const profile = await requireStaff();
  if (!profile) return null;

  const supabase = await getSupabaseServerClient();

  const [statsResult, pendingResult, ticketsResult] = await Promise.all([
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
        title="Dashboard"
        description={`Signed in as ${profile.nickname} (${profile.role}). Figures are live from Supabase; times are UTC.`}
      />

      {!stats ? (
        <p className="mb-6 rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-[13px] text-content-tertiary">
          Dashboard statistics are unavailable — {statsResult.error?.message ?? "no data returned"}.
        </p>
      ) : (
        <div className="mb-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
          <StatTile label="Players" value={int(stats.players)} icon={Users} href="/admin/players" />
          <StatTile
            label="New today"
            value={int(stats.playersToday)}
            icon={UserPlus}
            tone="accent"
          />
          <StatTile
            label="Online now"
            value={int(stats.online)}
            icon={Radio}
            hint="Seen in the last 5 min"
            tone="success"
          />
          <StatTile
            label="Pending transactions"
            value={int(stats.pendingTx)}
            icon={Timer}
            tone={num(stats.pendingTx) > 0 ? "warning" : "neutral"}
            href="/admin/transactions?status=pending"
          />
          <StatTile
            label="Open tickets"
            value={int(stats.openTickets)}
            icon={LifeBuoy}
            tone={num(stats.openTickets) > 0 ? "warning" : "neutral"}
            href="/admin/support"
          />
          <StatTile label="Bets today" value={int(stats.betsToday)} icon={Dice5} href="/admin/bets" />
          <StatTile
            label="Wagered today"
            value={fmtUsdt(num(stats.wageredToday))}
            hint="Sum of stakes"
            icon={Coins}
          />
          <StatTile
            label="Deposits / withdrawals today"
            value={`${fmtUsdt(num(stats.depositsToday))} / ${fmtUsdt(num(stats.withdrawalsToday))}`}
            hint="Confirmed only"
            icon={num(stats.depositsToday) >= num(stats.withdrawalsToday) ? ArrowDownToLine : ArrowUpFromLine}
          />
        </div>
      )}

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <Section
          title="Pending transactions"
          description="Latest 10 awaiting review"
          action={
            <Link
              href="/admin/transactions?status=pending"
              className="text-[13px] font-semibold text-accent hover:underline"
            >
              View all
            </Link>
          }
        >
          <TableScroller>
            <Table minWidth="min-w-[560px]">
              <thead>
                <tr>
                  <Th>Player</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 ? (
                  <EmptyRow colSpan={5} label="Nothing waiting for review" />
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
                        <Td className="capitalize">{tx.type}</Td>
                        <Td className="text-right font-semibold tabular-nums text-content">
                          {fmtAmount(tx.amount)} {tx.coin}
                          <span className="ml-1.5 text-[11px] font-normal text-content-tertiary">
                            ≈ {fmtUsdt(usdtValue(tx.coin, tx.amount))} USDT
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
          title="Open tickets"
          description="Latest 10 by activity"
          action={
            <Link
              href="/admin/support"
              className="text-[13px] font-semibold text-accent hover:underline"
            >
              View inbox
            </Link>
          }
        >
          <TableScroller>
            <Table minWidth="min-w-[560px]">
              <thead>
                <tr>
                  <Th>Player</Th>
                  <Th>Subject</Th>
                  <Th>Status</Th>
                  <Th>Priority</Th>
                  <Th>Updated</Th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <EmptyRow colSpan={5} label="The inbox is empty" />
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
                        <Td className="text-content-tertiary">{fmtAgo(ticket.updated_at)}</Td>
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
