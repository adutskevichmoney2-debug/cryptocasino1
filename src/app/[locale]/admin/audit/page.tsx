import { getTranslations, setRequestLocale } from "next-intl/server";
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

/**
 * Audit action codes as stored by the RPCs. The translation key is the same
 * string with dots swapped for underscores, since next-intl treats a dot as a
 * namespace separator.
 */
const ACTIONS = [
  "balance.adjust",
  "tx.approve",
  "tx.reject",
  "account.status",
  "account.kyc",
  "account.role",
  "account.note",
  "account.player_id",
] as const;

type AuditActionKey =
  | "balance_adjust"
  | "tx_approve"
  | "tx_reject"
  | "account_status"
  | "account_kyc"
  | "account_role"
  | "account_note"
  | "account_player_id";

const ACTION_KEYS: Record<(typeof ACTIONS)[number], AuditActionKey> = {
  "balance.adjust": "balance_adjust",
  "tx.approve": "tx_approve",
  "tx.reject": "tx_reject",
  "account.status": "account_status",
  "account.kyc": "account_kyc",
  "account.role": "account_role",
  "account.note": "account_note",
  "account.player_id": "account_player_id",
};

function actionKey(action: string): AuditActionKey | null {
  return ACTION_KEYS[action as (typeof ACTIONS)[number]] ?? null;
}

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

  const t = await getTranslations("admin.audit");
  const tc = await getTranslations("admin.common");

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
      <AdminPageHeader title={t("title")} description={t("description")} />

      <AdminFilters
        basePath={BASE_PATH}
        values={filterValues}
        selects={[
          {
            name: "action",
            label: tc("columns.action"),
            options: [
              { value: "", label: tc("allActions") },
              ...ACTIONS.map((v) => ({ value: v, label: tc(`auditAction.${ACTION_KEYS[v]}`) })),
            ],
          },
        ]}
      />

      {error ? (
        <EmptyState icon={ScrollText} title={t("loadError")} description={error.message} />
      ) : (
        <>
          <TableScroller>
            <Table minWidth="min-w-[860px]">
              <thead>
                <tr>
                  <Th>{tc("columns.when")}</Th>
                  <Th>{tc("columns.actor")}</Th>
                  <Th>{tc("columns.action")}</Th>
                  <Th>{tc("columns.targetPlayer")}</Th>
                  <Th>{tc("columns.details")}</Th>
                  <Th>{tc("columns.ip")}</Th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow colSpan={6} label={t("empty")} />
                ) : (
                  rows.map((row) => {
                    const actor = profiles.get(row.actor_id);
                    const target = row.target_user ? profiles.get(row.target_user) : undefined;
                    const key = actionKey(row.action);
                    return (
                      <Tr key={row.id}>
                        <Td className="text-content-tertiary">{fmtDateTime(row.created_at)}</Td>
                        <Td className="font-semibold text-content">
                          {actor?.nickname ?? shortId(row.actor_id)}
                        </Td>
                        <Td>
                          <Badge variant="outline">
                            {key ? tc(`auditAction.${key}`) : row.action}
                          </Badge>
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
