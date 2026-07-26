"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Inbox, MessageSquare, Send, UserCheck } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/lib/cn";
import type { SupportMessageRow, TicketPriority, TicketStatus } from "@/lib/supabase/types";
import { TicketPriorityBadge, TicketStatusBadge } from "./badges";
import { fmtDateTime, fmtAgo } from "./format";
import { useErrorText } from "./errors";

export interface AdminTicket {
  id: string;
  user_id: string;
  subject: string;
  topic: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  playerNickname: string;
  playerNumber: number | null;
  playerAvatarId: number;
  assigneeNickname: string | null;
}

const STATUS_OPTIONS: TicketStatus[] = ["open", "pending", "resolved", "closed"];
const PRIORITY_OPTIONS: TicketPriority[] = ["low", "normal", "high", "urgent"];

export function SupportInbox({
  initialTickets,
  viewerId,
  viewerNickname,
}: {
  initialTickets: AdminTicket[];
  viewerId: string;
  viewerNickname: string;
}) {
  const t = useTranslations("admin.support");
  const tc = useTranslations("admin.common");
  const errorText = useErrorText();
  const router = useRouter();
  const pushToast = useUiStore((s) => s.pushToast);

  const ago = (value?: string | null) => fmtAgo(value, (unit, n) => tc(`ago.${unit}`, { n }));
  const statusOptions = STATUS_OPTIONS.map((v) => ({ value: v, label: tc(`ticketStatus.${v}`) }));
  const priorityOptions = PRIORITY_OPTIONS.map((v) => ({
    value: v,
    label: tc(`ticketPriority.${v}`),
  }));

  const [tickets, setTickets] = useState(initialTickets);
  const [selectedId, setSelectedId] = useState<string | null>(initialTickets[0]?.id ?? null);
  const [messages, setMessages] = useState<SupportMessageRow[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);

  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const threadEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTickets(initialTickets);
    setSelectedId((current) =>
      current && initialTickets.some((t) => t.id === current)
        ? current
        : (initialTickets[0]?.id ?? null),
    );
  }, [initialTickets]);

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  const appendMessage = useCallback((row: SupportMessageRow) => {
    setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
  }, []);

  // Load the thread for the selected ticket.
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setLoadingThread(true);
    void (async () => {
      const { data, error } = await getSupabaseBrowserClient()
        .from("support_messages")
        .select("*")
        .eq("ticket_id", selectedId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      if (error) pushToast("error", errorText(error));
      setMessages(data ?? []);
      setLoadingThread(false);
      setUnread((prev) => {
        if (!prev[selectedId]) return prev;
        const next = { ...prev };
        delete next[selectedId];
        return next;
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, pushToast, errorText]);

  // Realtime: new player messages land without a refresh.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel("admin-support-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages" },
        (payload) => {
          const row = payload.new as unknown as SupportMessageRow;
          if (row.ticket_id === selectedIdRef.current) {
            appendMessage(row);
          } else if (!row.is_staff) {
            setUnread((prev) => ({ ...prev, [row.ticket_id]: (prev[row.ticket_id] ?? 0) + 1 }));
          }
          setTickets((prev) => {
            const index = prev.findIndex((t) => t.id === row.ticket_id);
            if (index === -1) return prev;
            const next = [...prev];
            next[index] = { ...next[index], updated_at: row.created_at };
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [appendMessage]);

  useEffect(() => {
    threadEnd.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const send = async () => {
    const body = reply.trim();
    if (!body || !selected) return;
    setSending(true);
    try {
      const { data, error } = await getSupabaseBrowserClient()
        .from("support_messages")
        .insert({ ticket_id: selected.id, sender_id: viewerId, is_staff: true, body })
        .select()
        .single();
      if (error) throw error;
      if (data) appendMessage(data);
      setReply("");
    } catch (error) {
      pushToast("error", errorText(error));
    } finally {
      setSending(false);
    }
  };

  const patchTicket = async (patch: Partial<AdminTicket>, ok: string) => {
    if (!selected) return;
    setUpdating(true);
    try {
      const { error } = await getSupabaseBrowserClient()
        .from("support_tickets")
        .update({
          status: patch.status,
          priority: patch.priority,
          assigned_to: patch.assigned_to,
          closed_at:
            patch.status === "closed" || patch.status === "resolved"
              ? new Date().toISOString()
              : undefined,
        })
        .eq("id", selected.id);
      if (error) throw error;
      setTickets((prev) => prev.map((t) => (t.id === selected.id ? { ...t, ...patch } : t)));
      pushToast("success", ok);
      router.refresh();
    } catch (error) {
      pushToast("error", errorText(error));
    } finally {
      setUpdating(false);
    }
  };

  if (tickets.length === 0) {
    return (
      <EmptyState icon={Inbox} title={t("emptyTitle")} description={t("emptyDescription")} />
    );
  }

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
      {/* ── Ticket list ──────────────────────────────────────────────── */}
      <Card className={cn("min-w-0 overflow-hidden", selected && "max-lg:hidden")}>
        <p className="border-b border-line px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-content-tertiary">
          {t("ticketCount", { count: tickets.length })}
        </p>
        <ul className="max-h-[70dvh] divide-y divide-line overflow-y-auto">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <button
                type="button"
                onClick={() => setSelectedId(ticket.id)}
                className={cn(
                  "flex w-full cursor-pointer flex-col gap-1 px-3 py-2.5 text-left transition-colors duration-120",
                  ticket.id === selectedId ? "bg-surface-3" : "hover:bg-surface-2",
                )}
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    nickname={ticket.playerNickname}
                    avatarId={ticket.playerAvatarId}
                    size="xs"
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-content">
                    {ticket.playerNickname}
                  </span>
                  {unread[ticket.id] ? (
                    <span className="rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-content">
                      {unread[ticket.id]}
                    </span>
                  ) : null}
                </div>
                <span className="truncate text-xs text-content-secondary">{ticket.subject}</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  <TicketStatusBadge status={ticket.status} />
                  <TicketPriorityBadge priority={ticket.priority} />
                  <span className="ml-auto text-[11px] text-content-tertiary">
                    {ago(ticket.updated_at)}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {/* ── Thread ───────────────────────────────────────────────────── */}
      {selected && (
        <Card className="flex min-w-0 flex-col overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5">
            <Button
              variant="ghost"
              size="xs"
              className="lg:hidden"
              onClick={() => setSelectedId(null)}
            >
              <ArrowLeft className="size-4" />
              {tc("back")}
            </Button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-content">{selected.subject}</p>
              <p className="truncate text-[11px] text-content-tertiary">
                <Link
                  href={`/admin/players/${selected.user_id}`}
                  className="font-semibold text-content-secondary hover:text-accent"
                >
                  {selected.playerNickname}
                </Link>
                {selected.playerNumber !== null && ` · #${selected.playerNumber}`}
                {selected.topic && ` · ${selected.topic}`} ·{" "}
                {t("opened", { date: fmtDateTime(selected.created_at) })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
            <div className="w-32">
              <Select
                aria-label={t("statusAria")}
                options={statusOptions}
                value={selected.status}
                disabled={updating}
                onChange={(e) =>
                  patchTicket({ status: e.target.value as TicketStatus }, t("statusUpdated"))
                }
                className="h-8 text-[13px]"
              />
            </div>
            <div className="w-32">
              <Select
                aria-label={t("priorityAria")}
                options={priorityOptions}
                value={selected.priority}
                disabled={updating}
                onChange={(e) =>
                  patchTicket({ priority: e.target.value as TicketPriority }, t("priorityUpdated"))
                }
                className="h-8 text-[13px]"
              />
            </div>
            <Button
              size="xs"
              variant="secondary"
              disabled={updating || selected.assigned_to === viewerId}
              onClick={() =>
                patchTicket(
                  { assigned_to: viewerId, assigneeNickname: viewerNickname },
                  t("assigned"),
                )
              }
            >
              <UserCheck className="size-3.5" />
              {selected.assigned_to === viewerId
                ? t("assignedToYou")
                : selected.assigneeNickname
                  ? t("assignedTo", { name: selected.assigneeNickname })
                  : t("assignToMe")}
            </Button>
          </div>

          <div className="flex max-h-[52dvh] min-h-[240px] flex-col gap-2.5 overflow-y-auto px-3 py-3">
            {loadingThread ? (
              <>
                <Skeleton className="h-14 w-2/3" />
                <Skeleton className="ml-auto h-14 w-2/3" />
                <Skeleton className="h-14 w-1/2" />
              </>
            ) : messages.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title={t("noMessagesTitle")}
                description={t("noMessagesDescription")}
                className="border-0"
              />
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed",
                    message.is_staff
                      ? "ml-auto bg-accent-soft text-content"
                      : "bg-surface-3 text-content",
                  )}
                >
                  <p className="whitespace-pre-wrap break-words">{message.body}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-content-tertiary">
                    {message.is_staff ? t("staff") : selected.playerNickname} ·{" "}
                    {fmtDateTime(message.created_at)}
                  </p>
                </div>
              ))
            )}
            <div ref={threadEnd} />
          </div>

          <form
            className="flex items-end gap-2 border-t border-line px-3 py-2.5"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <textarea
              value={reply}
              rows={2}
              maxLength={4000}
              placeholder={t("replyPlaceholder")}
              onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              className="min-w-0 flex-1 resize-none rounded-md border border-line-strong bg-surface-2 px-3 py-2 text-sm text-content outline-none transition-colors duration-120 placeholder:text-content-disabled hover:border-graphite-500 focus:border-accent focus:ring-2 focus:ring-accent-soft"
            />
            <Button type="submit" size="sm" loading={sending} disabled={!reply.trim()}>
              <Send className="size-4" />
              {t("send")}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
