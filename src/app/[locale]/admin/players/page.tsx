import { setRequestLocale } from "next-intl/server";
import { Users } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import type { AccountStatus, ProfileRow, UserRole } from "@/lib/supabase/types";
import { requireStaff } from "@/components/admin/guard";
import { AdminPageHeader } from "@/components/admin/Panels";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyRow, RowLink, Table, TableScroller, Td, Th, Tr } from "@/components/admin/Table";
import { KycBadge, RoleBadge, StatusBadge } from "@/components/admin/badges";
import { fmtAgo, fmtDate, fmtUsdt, usdtValue } from "@/components/admin/format";
import { PAGE_SIZE, pageFrom, param, rangeFor, type RawSearchParams } from "@/components/admin/query";

const BASE_PATH = "/admin/players";

const STATUS_VALUES: AccountStatus[] = ["active", "frozen", "self_excluded", "banned"];
const ROLE_VALUES: UserRole[] = ["player", "support", "admin"];

export default async function AdminPlayersPage({
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
  const q = param(sp, "q");
  const status = param(sp, "status");
  const role = param(sp, "role");
  const page = pageFrom(sp);
  const [from, to] = rangeFor(page);

  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status as AccountStatus);
  if (role) query = query.eq("role", role as UserRole);
  if (q) {
    // A pure number is a public player id; anything else matches nickname/email.
    if (/^\d+$/.test(q)) query = query.eq("player_id", Number(q));
    else query = query.or(`nickname.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, count, error } = await query;
  const players: ProfileRow[] = data ?? [];

  // Balances for the visible page only, converted to a USDT-equivalent total.
  const totals = new Map<string, number>();
  if (players.length > 0) {
    const { data: balances } = await supabase
      .from("balances")
      .select("user_id, coin, amount")
      .in(
        "user_id",
        players.map((p) => p.id),
      )
      .gt("amount", 0);

    for (const balance of balances ?? []) {
      totals.set(
        balance.user_id,
        (totals.get(balance.user_id) ?? 0) + usdtValue(balance.coin, balance.amount),
      );
    }
  }

  const filterValues = { q, status, role };

  return (
    <>
      <AdminPageHeader
        title="Players"
        description="Search by nickname, email or player id. Balances are an indicative USDT equivalent."
      />

      <AdminFilters
        basePath={BASE_PATH}
        values={filterValues}
        searchName="q"
        searchPlaceholder="Nickname, email or player id"
        selects={[
          {
            name: "status",
            label: "Status",
            options: [
              { value: "", label: "All statuses" },
              ...STATUS_VALUES.map((v) => ({ value: v, label: v })),
            ],
          },
          {
            name: "role",
            label: "Role",
            options: [
              { value: "", label: "All roles" },
              ...ROLE_VALUES.map((v) => ({ value: v, label: v })),
            ],
          },
        ]}
      />

      {error ? (
        <EmptyState icon={Users} title="Could not load players" description={error.message} />
      ) : (
        <>
          <TableScroller>
            <Table minWidth="min-w-[880px]">
              <thead>
                <tr>
                  <Th>Player id</Th>
                  <Th>Nickname</Th>
                  <Th>Email</Th>
                  <Th>Status</Th>
                  <Th>KYC</Th>
                  <Th>Role</Th>
                  <Th className="text-right">Balance (USDT eq.)</Th>
                  <Th>Registered</Th>
                  <Th>Last seen</Th>
                </tr>
              </thead>
              <tbody>
                {players.length === 0 ? (
                  <EmptyRow colSpan={9} label="No players match these filters" />
                ) : (
                  players.map((player) => (
                    <Tr key={player.id}>
                      <Td className="font-mono text-xs">
                        <RowLink href={`${BASE_PATH}/${player.id}`}>{player.player_id}</RowLink>
                      </Td>
                      <Td className="font-semibold text-content">{player.nickname}</Td>
                      <Td className="max-w-[220px] truncate">{player.email}</Td>
                      <Td>
                        <StatusBadge status={player.status} />
                      </Td>
                      <Td>
                        <KycBadge status={player.kyc_status} />
                      </Td>
                      <Td>
                        <RoleBadge role={player.role} />
                      </Td>
                      <Td className="text-right font-semibold tabular-nums text-content">
                        {fmtUsdt(totals.get(player.id) ?? 0)}
                      </Td>
                      <Td className="text-content-tertiary">{fmtDate(player.created_at)}</Td>
                      <Td className="text-content-tertiary">{fmtAgo(player.last_seen_at)}</Td>
                    </Tr>
                  ))
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
            shown={players.length}
          />
        </>
      )}
    </>
  );
}
