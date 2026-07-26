import { setRequestLocale } from "next-intl/server";
import { ScrollText } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { AdminActionRow } from "@/lib/supabase/types";
import { requireAdmin } from "@/components/admin/guard";
import { loadProfiles } from "@/components/admin/data";
import { AdminPageHeader } from "@/components/admin/Panels";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyRow, RowLink, Table, TableScroller, Td, Th, Tr } from "@/components/admin/Table";
import { DASH, fmtDateTime, shortId } from "@/components/admin/format";
import { PAGE_SIZE, pageFrom, param, rangeFor, type RawSearchParams } from "@/components/admin/query";

const BASE_PATH = "/admin/audit";

const ACTIONS = [
  "balance.adjust",
  "tx.approve",
  "tx.reject",
  "account.status",
  "account.kyc",
  "account.role",
  "account.note",
];

/** Renders the jsonb details column as compact `key: value` pairs. */
function detailPairs(details: Record<string, unknown> | null): string {
  if (!details) return DASH;
  const pairs = Object.entries(details)
    .filter(([, value]) => value !== null && value !== "")
    .map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`);
  return pairs.length > 0 ? pairs.join(" · ") : DASH;
}

export default async function AdminAuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<RawSearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  // Admin-only on top of the RLS policy, which already restricts admin_actions.
  const viewer = await requireAdmin();
  if (!viewer) return null;

  const sp = await searchParams;
  const action = param(sp, "action");
  const page = pageFrom(sp);
  const [from, to] = rangeFor(page);

  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("admin_actions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (action) query = query.eq("action", action);

  const { data, count, error } = await query;
  const rows: AdminActionRow[] = data ?? [];
  const profiles = await loadProfiles(supabase, [
    ...rows.map((row) => row.actor_id),
    ...rows.map((row) => row.target_user),
  ]);

  const filterValues = { action };

  return (
    <>
      <AdminPageHeader
        title="Audit log"
        description="Every operator action against a player account. Insert-only and visible to admins."
      />

      <AdminFilters
        basePath={BASE_PATH}
        values={filterValues}
        selects={[
          {
            name: "action",
            label: "Action",
            options: [
              { value: "", label: "All actions" },
              ...ACTIONS.map((v) => ({ value: v, label: v })),
            ],
          },
        ]}
      />

      {error ? (
        <EmptyState icon={ScrollText} title="Could not load the audit log" description={error.message} />
      ) : (
        <>
          <TableScroller>
            <Table minWidth="min-w-[860px]">
              <thead>
                <tr>
                  <Th>When</Th>
                  <Th>Actor</Th>
                  <Th>Action</Th>
                  <Th>Target player</Th>
                  <Th>Details</Th>
                  <Th>IP</Th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow colSpan={6} label="No operator actions recorded yet" />
                ) : (
                  rows.map((row) => {
                    const actor = profiles.get(row.actor_id);
                    const target = row.target_user ? profiles.get(row.target_user) : undefined;
                    return (
                      <Tr key={row.id}>
                        <Td className="text-content-tertiary">{fmtDateTime(row.created_at)}</Td>
                        <Td className="font-semibold text-content">
                          {actor?.nickname ?? shortId(row.actor_id)}
                        </Td>
                        <Td>
                          <Badge variant="outline">{row.action}</Badge>
                        </Td>
                        <Td>
                          {row.target_user ? (
                            <RowLink href={`/admin/players/${row.target_user}`}>
                              {target?.nickname ?? shortId(row.target_user)}
                            </RowLink>
                          ) : (
                            DASH
                          )}
                        </Td>
                        <Td className="max-w-[320px] truncate">{detailPairs(row.details)}</Td>
                        <Td className="font-mono text-xs">{row.ip ?? DASH}</Td>
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
