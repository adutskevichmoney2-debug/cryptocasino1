import { setRequestLocale } from "next-intl/server";
import { Ticket } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import type { BetRow, DbBetStatus } from "@/lib/supabase/types";
import { requireStaff } from "@/components/admin/guard";
import { loadProfiles } from "@/components/admin/data";
import { AdminPageHeader } from "@/components/admin/Panels";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyRow, RowLink, Table, TableScroller, Td, Th, Tr } from "@/components/admin/Table";
import { BetStatusBadge } from "@/components/admin/badges";
import { DASH, fmtAmount, fmtDateTime, shortId } from "@/components/admin/format";
import { PAGE_SIZE, pageFrom, param, rangeFor, type RawSearchParams } from "@/components/admin/query";

const BASE_PATH = "/admin/bets";
const STATUSES: DbBetStatus[] = ["open", "won", "lost", "void", "cashed_out"];

/** First selection label, used as a readable summary of the slip. */
function selectionSummary(selections: unknown): string {
  if (!Array.isArray(selections) || selections.length === 0) return DASH;
  const first = selections[0] as Record<string, unknown> | null;
  const label =
    first && typeof first === "object"
      ? (first.eventLabel ?? first.label ?? first.marketLabel)
      : null;
  const text = typeof label === "string" && label ? label : "Selection";
  return selections.length > 1 ? `${text} +${selections.length - 1}` : text;
}

export default async function AdminBetsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const viewer = await requireStaff();
  if (!viewer) return null;

  const sp = await searchParams;
  const status = param(sp, "status");
  const page = pageFrom(sp);
  const [from, to] = rangeFor(page);

  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("bets")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status as DbBetStatus);

  const { data, count, error } = await query;
  const rows: BetRow[] = data ?? [];
  const profiles = await loadProfiles(
    supabase,
    rows.map((bet) => bet.user_id),
  );

  const filterValues = { status };

  return (
    <>
      <AdminPageHeader title="Bets" description="Every sports bet placed on the platform." />

      <AdminFilters
        basePath={BASE_PATH}
        values={filterValues}
        selects={[
          {
            name: "status",
            label: "Status",
            options: [
              { value: "", label: "All statuses" },
              ...STATUSES.map((v) => ({ value: v, label: v })),
            ],
          },
        ]}
      />

      {error ? (
        <EmptyState icon={Ticket} title="Could not load bets" description={error.message} />
      ) : (
        <>
          <TableScroller>
            <Table minWidth="min-w-[940px]">
              <thead>
                <tr>
                  <Th>Bet</Th>
                  <Th>Player</Th>
                  <Th>Slip</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Stake</Th>
                  <Th className="text-right">Odds</Th>
                  <Th className="text-right">Potential win</Th>
                  <Th className="text-right">Payout</Th>
                  <Th>Status</Th>
                  <Th>Placed</Th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow colSpan={10} label="No bets match this filter" />
                ) : (
                  rows.map((bet) => {
                    const player = profiles.get(bet.user_id);
                    return (
                      <Tr key={bet.id}>
                        <Td className="font-mono text-xs">{shortId(bet.id)}</Td>
                        <Td>
                          <RowLink href={`/admin/players/${bet.user_id}`}>
                            {player?.nickname ?? shortId(bet.user_id)}
                          </RowLink>
                        </Td>
                        <Td className="max-w-[220px] truncate">
                          {selectionSummary(bet.selections)}
                        </Td>
                        <Td className="capitalize">{bet.bet_type}</Td>
                        <Td className="text-right font-semibold tabular-nums text-content">
                          {fmtAmount(bet.stake)} {bet.coin}
                        </Td>
                        <Td className="text-right tabular-nums">{fmtAmount(bet.total_odds, 2)}</Td>
                        <Td className="text-right tabular-nums">
                          {fmtAmount(bet.potential_win, 4)}
                        </Td>
                        <Td className="text-right tabular-nums">
                          {bet.payout === null ? DASH : fmtAmount(bet.payout, 4)}
                        </Td>
                        <Td>
                          <BetStatusBadge status={bet.status} />
                        </Td>
                        <Td className="text-content-tertiary">{fmtDateTime(bet.created_at)}</Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </TableScroller>

          <Pagination
            basePath={BASE_PATH}
            params={filterValues}
            page={page}
            total={count ?? null}
            pageSize={PAGE_SIZE}
            shown={rows.length}
          />
        </>
      )}
    </>
  );
}
