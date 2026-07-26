import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import type {
  BetRow,
  GameRoundRow,
  SupportTicketRow,
  TransactionRow,
  UserBonusRow,
  UserSessionRow,
} from "@/lib/supabase/types";
import { requireStaff } from "@/components/admin/guard";
import { loadProfiles } from "@/components/admin/data";
import { Field, Section } from "@/components/admin/Panels";
import { PlayerActions } from "@/components/admin/PlayerActions";
import { EmptyRow, RowLink, Table, TableScroller, Td, Th, Tr } from "@/components/admin/Table";
import {
  BetStatusBadge,
  CREDIT_TYPES,
  KycBadge,
  RoleBadge,
  StatusBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
  TxStatusBadge,
} from "@/components/admin/badges";
import {
  DASH,
  fmtAgo,
  fmtAmount,
  fmtDateTime,
  fmtUsdt,
  num,
  shortId,
  usdtValue,
} from "@/components/admin/format";

const ROW_LIMIT = 20;

export default async function AdminPlayerDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale as Locale);

  const viewer = await requireStaff();
  if (!viewer) return null;

  const supabase = await getSupabaseServerClient();

  const { data: player } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!player) notFound();

  const [balances, transactions, bets, rounds, sessions, bonuses, tickets] = await Promise.all([
    supabase.from("balances").select("*").eq("user_id", id).order("coin"),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(ROW_LIMIT),
    supabase
      .from("bets")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(ROW_LIMIT),
    supabase
      .from("game_rounds")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .limit(ROW_LIMIT),
    supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", id)
      .order("last_seen_at", { ascending: false })
      .limit(ROW_LIMIT),
    supabase
      .from("user_bonuses")
      .select("*")
      .eq("user_id", id)
      .order("claimed_at", { ascending: false })
      .limit(ROW_LIMIT),
    supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", id)
      .order("updated_at", { ascending: false })
      .limit(ROW_LIMIT),
  ]);

  const staffNames = await loadProfiles(supabase, [player.status_changed_by]);
  const changedBy = player.status_changed_by
    ? (staffNames.get(player.status_changed_by)?.nickname ?? shortId(player.status_changed_by))
    : null;

  const balanceRows = balances.data ?? [];
  const txRows: TransactionRow[] = transactions.data ?? [];
  const betRows: BetRow[] = bets.data ?? [];
  const roundRows: GameRoundRow[] = rounds.data ?? [];
  const sessionRows: UserSessionRow[] = sessions.data ?? [];
  const bonusRows: UserBonusRow[] = bonuses.data ?? [];
  const ticketRows: SupportTicketRow[] = tickets.data ?? [];

  const totalUsdt = balanceRows.reduce(
    (sum, balance) => sum + usdtValue(balance.coin, balance.amount),
    0,
  );

  return (
    <>
      <Link
        href="/admin/players"
        className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-content-tertiary transition-colors duration-120 hover:text-content"
      >
        <ArrowLeft className="size-4" />
        All players
      </Link>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Avatar nickname={player.nickname} avatarId={player.avatar_id} size="lg" />
        <div className="min-w-0">
          <h1 className="font-display text-xl font-extrabold text-content sm:text-2xl">
            {player.nickname}
          </h1>
          <p className="text-[13px] text-content-tertiary">
            #{player.player_id} · {player.email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
          <StatusBadge status={player.status} />
          <KycBadge status={player.kyc_status} />
          <RoleBadge role={player.role} />
        </div>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          {/* ── Overview ─────────────────────────────────────────────── */}
          <Section title="Overview">
            <Card className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
              <Field label="User id">
                <span className="font-mono text-xs">{player.id}</span>
              </Field>
              <Field label="Player id">#{player.player_id}</Field>
              <Field label="Referral code">
                <span className="font-mono text-xs">{player.ref_code}</span>
              </Field>
              <Field label="Referred by">
                <span className="font-mono text-xs">{player.referred_by ?? DASH}</span>
              </Field>
              <Field label="XP">{num(player.xp).toLocaleString("en-US")}</Field>
              <Field label="Wagered total">{fmtAmount(player.wagered_total, 2)}</Field>
              <Field label="Two-factor">{player.two_factor_enabled ? "Enabled" : "Disabled"}</Field>
              <Field label="Registered">{fmtDateTime(player.created_at)}</Field>
              <Field label="Last seen">
                {fmtAgo(player.last_seen_at)}
                <span className="ml-1 text-[11px] text-content-tertiary">
                  {player.last_seen_at ? `(${fmtDateTime(player.last_seen_at)})` : ""}
                </span>
              </Field>
              <Field label="Status reason">{player.status_reason ?? DASH}</Field>
              <Field label="Status changed">
                {player.status_changed_at ? fmtDateTime(player.status_changed_at) : DASH}
                {changedBy && (
                  <span className="ml-1 text-[11px] text-content-tertiary">by {changedBy}</span>
                )}
              </Field>
              <Field label="Total balance">
                <span className="font-semibold text-content">{fmtUsdt(totalUsdt)} USDT eq.</span>
              </Field>
              <div className="col-span-2 sm:col-span-3">
                <Field label="Internal note">
                  <span className="whitespace-pre-wrap text-content-secondary">
                    {player.internal_note?.trim() || DASH}
                  </span>
                </Field>
              </div>
            </Card>
          </Section>

          {/* ── Balances ─────────────────────────────────────────────── */}
          <Section title="Balances" description="Per coin, with indicative USDT value">
            <TableScroller>
              <Table minWidth="min-w-[420px]">
                <thead>
                  <tr>
                    <Th>Coin</Th>
                    <Th className="text-right">Amount</Th>
                    <Th className="text-right">USDT eq.</Th>
                    <Th>Updated</Th>
                  </tr>
                </thead>
                <tbody>
                  {balanceRows.length === 0 ? (
                    <EmptyRow colSpan={4} label="No balance rows" />
                  ) : (
                    balanceRows.map((balance) => (
                      <Tr key={balance.coin}>
                        <Td className="font-semibold text-content">{balance.coin}</Td>
                        <Td className="text-right tabular-nums text-content">
                          {fmtAmount(balance.amount)}
                        </Td>
                        <Td className="text-right tabular-nums">
                          {fmtUsdt(usdtValue(balance.coin, balance.amount))}
                        </Td>
                        <Td className="text-content-tertiary">{fmtDateTime(balance.updated_at)}</Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableScroller>
          </Section>

          {/* ── Transactions ─────────────────────────────────────────── */}
          <Section
            title="Transactions"
            description={`Latest ${ROW_LIMIT}`}
            action={
              <Link
                href="/admin/transactions"
                className="text-[13px] font-semibold text-accent hover:underline"
              >
                All transactions
              </Link>
            }
          >
            <TableScroller>
              <Table minWidth="min-w-[720px]">
                <thead>
                  <tr>
                    <Th>Type</Th>
                    <Th className="text-right">Amount</Th>
                    <Th className="text-right">Fee</Th>
                    <Th className="text-right">Balance after</Th>
                    <Th>Status</Th>
                    <Th>Note</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {txRows.length === 0 ? (
                    <EmptyRow colSpan={7} label="No transactions" />
                  ) : (
                    txRows.map((tx) => (
                      <Tr key={tx.id}>
                        <Td className="capitalize text-content">{tx.type}</Td>
                        <Td
                          className={`text-right font-semibold tabular-nums ${
                            CREDIT_TYPES.includes(tx.type) ? "text-success" : "text-content"
                          }`}
                        >
                          {CREDIT_TYPES.includes(tx.type) ? "+" : "−"}
                          {fmtAmount(tx.amount)} {tx.coin}
                        </Td>
                        <Td className="text-right tabular-nums">{fmtAmount(tx.fee)}</Td>
                        <Td className="text-right tabular-nums">
                          {tx.balance_after === null ? DASH : fmtAmount(tx.balance_after)}
                        </Td>
                        <Td>
                          <TxStatusBadge status={tx.status} />
                        </Td>
                        <Td className="max-w-[200px] truncate">{tx.note ?? DASH}</Td>
                        <Td className="text-content-tertiary">{fmtDateTime(tx.created_at)}</Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableScroller>
          </Section>

          {/* ── Bets ─────────────────────────────────────────────────── */}
          <Section title="Bets" description={`Latest ${ROW_LIMIT} sports bets`}>
            <TableScroller>
              <Table minWidth="min-w-[620px]">
                <thead>
                  <tr>
                    <Th>Bet</Th>
                    <Th>Type</Th>
                    <Th className="text-right">Stake</Th>
                    <Th className="text-right">Odds</Th>
                    <Th className="text-right">Payout</Th>
                    <Th>Status</Th>
                    <Th>Created</Th>
                  </tr>
                </thead>
                <tbody>
                  {betRows.length === 0 ? (
                    <EmptyRow colSpan={7} label="No bets" />
                  ) : (
                    betRows.map((bet) => (
                      <Tr key={bet.id}>
                        <Td className="font-mono text-xs">{shortId(bet.id)}</Td>
                        <Td className="capitalize">{bet.bet_type}</Td>
                        <Td className="text-right tabular-nums text-content">
                          {fmtAmount(bet.stake)} {bet.coin}
                        </Td>
                        <Td className="text-right tabular-nums">{fmtAmount(bet.total_odds, 2)}</Td>
                        <Td className="text-right tabular-nums">
                          {bet.payout === null ? DASH : fmtAmount(bet.payout)}
                        </Td>
                        <Td>
                          <BetStatusBadge status={bet.status} />
                        </Td>
                        <Td className="text-content-tertiary">{fmtDateTime(bet.created_at)}</Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableScroller>
          </Section>

          {/* ── Game rounds ──────────────────────────────────────────── */}
          <Section title="Game rounds" description={`Latest ${ROW_LIMIT} casino rounds`}>
            <TableScroller>
              <Table minWidth="min-w-[560px]">
                <thead>
                  <tr>
                    <Th>Game</Th>
                    <Th>Provider</Th>
                    <Th className="text-right">Bet</Th>
                    <Th className="text-right">Win</Th>
                    <Th>Played</Th>
                  </tr>
                </thead>
                <tbody>
                  {roundRows.length === 0 ? (
                    <EmptyRow colSpan={5} label="No game rounds" />
                  ) : (
                    roundRows.map((round) => (
                      <Tr key={round.id}>
                        <Td className="text-content">{round.game_slug}</Td>
                        <Td>{round.provider ?? DASH}</Td>
                        <Td className="text-right tabular-nums">
                          {fmtAmount(round.bet_amount)} {round.coin}
                        </Td>
                        <Td
                          className={`text-right tabular-nums ${
                            num(round.win_amount) > 0 ? "text-success" : ""
                          }`}
                        >
                          {fmtAmount(round.win_amount)} {round.coin}
                        </Td>
                        <Td className="text-content-tertiary">{fmtDateTime(round.created_at)}</Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableScroller>
          </Section>

          {/* ── Sessions ─────────────────────────────────────────────── */}
          <Section title="Sessions" description="Devices and locations seen on this account">
            <TableScroller>
              <Table minWidth="min-w-[760px]">
                <thead>
                  <tr>
                    <Th>IP</Th>
                    <Th>Device</Th>
                    <Th>Browser</Th>
                    <Th>OS</Th>
                    <Th>Location</Th>
                    <Th>First seen</Th>
                    <Th>Last seen</Th>
                  </tr>
                </thead>
                <tbody>
                  {sessionRows.length === 0 ? (
                    <EmptyRow colSpan={7} label="No sessions recorded" />
                  ) : (
                    sessionRows.map((session) => (
                      <Tr key={session.id}>
                        <Td className="font-mono text-xs text-content">{session.ip ?? DASH}</Td>
                        <Td className="capitalize">{session.device_type ?? DASH}</Td>
                        <Td>{session.browser ?? DASH}</Td>
                        <Td>{session.os ?? DASH}</Td>
                        <Td>
                          {[session.city, session.country].filter(Boolean).join(", ") || DASH}
                        </Td>
                        <Td className="text-content-tertiary">{fmtDateTime(session.created_at)}</Td>
                        <Td className="text-content-tertiary">
                          {fmtDateTime(session.last_seen_at)}
                        </Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableScroller>
          </Section>

          {/* ── Bonuses ──────────────────────────────────────────────── */}
          <Section title="Bonuses" description="Claimed promo codes and wagering progress">
            <TableScroller>
              <Table minWidth="min-w-[600px]">
                <thead>
                  <tr>
                    <Th>Code</Th>
                    <Th className="text-right">Amount</Th>
                    <Th className="text-right">Wagered</Th>
                    <Th>Claimed</Th>
                    <Th>Expires</Th>
                  </tr>
                </thead>
                <tbody>
                  {bonusRows.length === 0 ? (
                    <EmptyRow colSpan={5} label="No bonuses claimed" />
                  ) : (
                    bonusRows.map((bonus) => (
                      <Tr key={bonus.id}>
                        <Td className="font-mono text-xs text-content">{bonus.code}</Td>
                        <Td className="text-right tabular-nums">
                          {fmtAmount(bonus.amount)} {bonus.coin}
                        </Td>
                        <Td className="text-right tabular-nums">
                          {fmtAmount(bonus.wager_done, 2)} / {fmtAmount(bonus.wager_required, 2)}
                        </Td>
                        <Td className="text-content-tertiary">{fmtDateTime(bonus.claimed_at)}</Td>
                        <Td className="text-content-tertiary">{fmtDateTime(bonus.expires_at)}</Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableScroller>
          </Section>

          {/* ── Support tickets ──────────────────────────────────────── */}
          <Section title="Support tickets">
            <TableScroller>
              <Table minWidth="min-w-[560px]">
                <thead>
                  <tr>
                    <Th>Subject</Th>
                    <Th>Topic</Th>
                    <Th>Status</Th>
                    <Th>Priority</Th>
                    <Th>Updated</Th>
                  </tr>
                </thead>
                <tbody>
                  {ticketRows.length === 0 ? (
                    <EmptyRow colSpan={5} label="No tickets" />
                  ) : (
                    ticketRows.map((ticket) => (
                      <Tr key={ticket.id}>
                        <Td className="max-w-[220px] truncate">
                          <RowLink href="/admin/support">{ticket.subject}</RowLink>
                        </Td>
                        <Td>{ticket.topic ?? DASH}</Td>
                        <Td>
                          <TicketStatusBadge status={ticket.status} />
                        </Td>
                        <Td>
                          <TicketPriorityBadge priority={ticket.priority} />
                        </Td>
                        <Td className="text-content-tertiary">{fmtDateTime(ticket.updated_at)}</Td>
                      </Tr>
                    ))
                  )}
                </tbody>
              </Table>
            </TableScroller>
          </Section>
        </div>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="min-w-0 xl:sticky xl:top-[72px] xl:self-start">
          <PlayerActions
            userId={player.id}
            nickname={player.nickname}
            status={player.status}
            kycStatus={player.kyc_status}
            role={player.role}
            note={player.internal_note}
            viewerRole={viewer.role}
            viewerId={viewer.id}
          />
        </div>
      </div>
    </>
  );
}
