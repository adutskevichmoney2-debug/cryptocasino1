import { setRequestLocale } from "next-intl/server";
import { ArrowLeftRight } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/EmptyState";
import { shortenAddress } from "@/lib/format";
import type { DbCoin, DbTxStatus, DbTxType, TransactionRow } from "@/lib/supabase/types";
import { requireStaff } from "@/components/admin/guard";
import { loadProfiles } from "@/components/admin/data";
import { AdminPageHeader } from "@/components/admin/Panels";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { Pagination } from "@/components/admin/Pagination";
import { EmptyRow, RowLink, Table, TableScroller, Td, Th, Tr } from "@/components/admin/Table";
import { CREDIT_TYPES, TxStatusBadge } from "@/components/admin/badges";
import { TxReview } from "@/components/admin/TxReview";
import { DASH, fmtAmount, fmtDateTime, fmtUsdt, shortId, usdtValue } from "@/components/admin/format";
import { PAGE_SIZE, pageFrom, param, rangeFor, type RawSearchParams } from "@/components/admin/query";

const BASE_PATH = "/admin/transactions";

const STATUSES: DbTxStatus[] = ["pending", "processing", "confirmed", "rejected", "failed"];
const TYPES: DbTxType[] = ["deposit", "withdraw", "bet", "win", "bonus", "adjustment", "rollback"];
const COINS: DbCoin[] = ["BTC", "ETH", "USDT", "USDC", "TRX", "SOL", "LTC", "DOGE"];

export default async function AdminTransactionsPage({
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
  const type = param(sp, "type");
  const coin = param(sp, "coin");
  const page = pageFrom(sp);
  const [from, to] = rangeFor(page);

  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("transactions")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (status) query = query.eq("status", status as DbTxStatus);
  if (type) query = query.eq("type", type as DbTxType);
  if (coin) query = query.eq("coin", coin as DbCoin);

  const { data, count, error } = await query;
  const rows: TransactionRow[] = data ?? [];
  const profiles = await loadProfiles(
    supabase,
    rows.map((tx) => tx.user_id),
  );

  const filterValues = { status, type, coin };
  const canReview = viewer.role === "admin";

  return (
    <>
      <AdminPageHeader
        title="Transactions"
        description="The full ledger. Pending deposits and withdrawals can be approved or rejected here."
      />

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
          {
            name: "type",
            label: "Type",
            options: [
              { value: "", label: "All types" },
              ...TYPES.map((v) => ({ value: v, label: v })),
            ],
          },
          {
            name: "coin",
            label: "Coin",
            options: [
              { value: "", label: "All coins" },
              ...COINS.map((v) => ({ value: v, label: v })),
            ],
          },
        ]}
      />

      {error ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Could not load transactions"
          description={error.message}
        />
      ) : (
        <>
          <TableScroller>
            <Table minWidth="min-w-[1040px]">
              <thead>
                <tr>
                  <Th>Tx</Th>
                  <Th>Player</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Amount</Th>
                  <Th className="text-right">USDT eq.</Th>
                  <Th>Status</Th>
                  <Th>Network / address</Th>
                  <Th>Created</Th>
                  <Th>Review</Th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <EmptyRow colSpan={9} label="No transactions match these filters" />
                ) : (
                  rows.map((tx) => {
                    const player = profiles.get(tx.user_id);
                    const reviewable =
                      (tx.status === "pending" || tx.status === "processing") &&
                      (tx.type === "deposit" || tx.type === "withdraw");
                    return (
                      <Tr key={tx.id}>
                        <Td className="font-mono text-xs">{shortId(tx.id)}</Td>
                        <Td>
                          <RowLink href={`/admin/players/${tx.user_id}`}>
                            {player?.nickname ?? shortId(tx.user_id)}
                          </RowLink>
                        </Td>
                        <Td className="capitalize text-content">{tx.type}</Td>
                        <Td
                          className={`text-right font-semibold tabular-nums ${
                            CREDIT_TYPES.includes(tx.type) ? "text-success" : "text-content"
                          }`}
                        >
                          {CREDIT_TYPES.includes(tx.type) ? "+" : "−"}
                          {fmtAmount(tx.amount)} {tx.coin}
                        </Td>
                        <Td className="text-right tabular-nums">
                          {fmtUsdt(usdtValue(tx.coin, tx.amount))}
                        </Td>
                        <Td>
                          <TxStatusBadge status={tx.status} />
                        </Td>
                        <Td className="font-mono text-xs">
                          {tx.network ?? DASH}
                          {tx.address && ` · ${shortenAddress(tx.address)}`}
                        </Td>
                        <Td className="text-content-tertiary">{fmtDateTime(tx.created_at)}</Td>
                        <Td className="relative z-10">
                          {reviewable ? (
                            <TxReview
                              txId={tx.id}
                              type={tx.type}
                              coin={tx.coin}
                              amount={tx.amount}
                              player={player?.nickname ?? shortId(tx.user_id)}
                              canReview={canReview}
                            />
                          ) : (
                            <span className="text-content-tertiary">{DASH}</span>
                          )}
                        </Td>
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
