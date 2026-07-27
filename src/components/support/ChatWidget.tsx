"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Headset, SendHorizonal, X } from "lucide-react";
import { services } from "@/services";
import { useUiStore } from "@/stores/uiStore";
import { useMounted } from "@/hooks/useMounted";
import { IconButton } from "@/components/ui/IconButton";
import { Badge } from "@/components/ui/Badge";
import { LogoMark } from "@/components/ui/Logo";
import { fadeUp, transitionStructural } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/services/types";

/** Prefix of the optimistic bubble shown before the service echoes it back. */
const LOCAL_ID_PREFIX = "local-";
/** How close to the bottom counts as "following the conversation", in px. */
const STICK_THRESHOLD_PX = 72;

/** True when `message` is the server's copy of an optimistic bubble. */
function isLocalEcho(candidate: ChatMessage, message: ChatMessage) {
  return (
    candidate.id.startsWith(LOCAL_ID_PREFIX) &&
    candidate.from === "user" &&
    message.from === "user" &&
    candidate.text === message.text
  );
}

/**
 * Folds server messages into the visible thread. De-duplication is keyed on
 * message id; the one case an id cannot cover is the bubble the player just
 * sent, which is rendered optimistically under a local id and is matched by
 * its text so the server copy replaces it rather than doubling it.
 */
function mergeMessages(current: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  let next = current;
  for (const message of incoming) {
    if (next.some((m) => m.id === message.id)) continue;
    const echoIndex = next.findIndex((m) => isLocalEcho(m, message));
    next = echoIndex === -1 ? [...next, message] : next.map((m, i) => (i === echoIndex ? message : m));
  }
  if (next === current) return current;
  return [...next].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

function Bubble({ message }: { message: ChatMessage }) {
  const isBot = message.from === "bot";
  return (
    <div className={cn("flex", isBot ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed",
          isBot
            ? "rounded-bl-md bg-surface-3 text-content"
            : "rounded-br-md bg-accent text-accent-content",
        )}
      >
        {message.text}
      </div>
    </div>
  );
}

export function ChatWidget() {
  const t = useTranslations("chat");
  const locale = useLocale() as "en" | "ru";
  const mounted = useMounted();
  const open = useUiStore((s) => s.chatOpen);
  const setOpen = useUiStore((s) => s.setChatOpen);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  /** Ids already folded in — cheap guard before touching state. */
  const seenIds = useRef(new Set<string>());
  /** Whether the reader is parked at the bottom; false while reading history. */
  const stick = useRef(true);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
    if (open) setUnread(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    void services.support.getChatHistory().then((history) => {
      for (const message of history) seenIds.current.add(message.id);
      setMessages((prev) => mergeMessages(prev, history));
    });
  }, [open]);

  // Live transcript: a staff reply lands here without reopening the widget.
  useEffect(() => {
    const unsubscribe = services.support.onChatMessage((message) => {
      if (seenIds.current.has(message.id)) return;
      seenIds.current.add(message.id);
      setMessages((prev) => mergeMessages(prev, [message]));
      if (!openRef.current && message.from === "bot") setUnread((n) => n + 1);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!stick.current) return;
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");
    stick.current = true;

    const userMessage: ChatMessage = {
      id: `${LOCAL_ID_PREFIX}${Date.now()}`,
      from: "user",
      text,
      createdAt: new Date().toISOString(),
    };
    seenIds.current.add(userMessage.id);
    setMessages((prev) => [...prev, userMessage]);
    setTyping(true);

    const reply = await services.support.sendChatMessage(locale, text);
    setTyping(false);
    // The mock backend also pushes this reply through onChatMessage, so it may
    // already be in the thread by now.
    seenIds.current.add(reply.id);
    setMessages((prev) => mergeMessages(prev, [reply]));
  };

  if (!mounted) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={unread > 0 ? `${t("open")} — ${t("unread", { count: unread })}` : t("open")}
          className="fixed bottom-4 right-4 z-[80] flex size-12 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-content shadow-raised transition-transform duration-120 hover:scale-105 max-lg:bottom-[calc(72px+env(safe-area-inset-bottom))]"
        >
          <Headset className="size-5" />
          {unread > 0 && (
            <Badge
              variant="danger"
              aria-hidden="true"
              className="pointer-events-none absolute -right-0.5 -top-0.5 min-w-5 justify-center rounded-full px-1 py-0 text-[10px] leading-5 shadow-raised"
            >
              {unread > 9 ? "9+" : unread}
            </Badge>
          )}
        </button>
      )}

      <AnimatePresence>
        {open && (
          <m.div
            variants={fadeUp}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transitionStructural}
            className="fixed bottom-4 right-4 z-[95] flex h-[480px] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-line bg-surface-1 shadow-modal max-lg:bottom-[calc(72px+env(safe-area-inset-bottom))]"
            role="dialog"
            aria-label={t("title")}
          >
            <div className="flex shrink-0 items-center gap-2.5 border-b border-line bg-surface-2 px-4 py-3">
              <LogoMark className="size-6" />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-content">{t("title")}</p>
                <p className="flex items-center gap-1.5 text-[11px] text-content-tertiary">
                  <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
                  {t("botName")}
                </p>
              </div>
              <IconButton label={t("title")} size="sm" onClick={() => setOpen(false)}>
                <X />
              </IconButton>
            </div>

            <div
              ref={scroller}
              onScroll={(e) => {
                const el = e.currentTarget;
                stick.current =
                  el.scrollHeight - el.scrollTop - el.clientHeight <= STICK_THRESHOLD_PX;
              }}
              className="flex-1 space-y-2.5 overflow-y-auto p-4"
            >
              <Bubble
                message={{
                  id: "greeting",
                  from: "bot",
                  text: t("greeting"),
                  createdAt: "",
                }}
              />
              {messages.map((msg) => (
                <Bubble key={msg.id} message={msg} />
              ))}
              {typing && (
                <p className="pl-1 text-[11px] italic text-content-tertiary">
                  {t("botName")} {t("typing")}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 border-t border-line p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void send()}
                placeholder={t("placeholder")}
                className="h-10 w-full min-w-0 rounded-md border border-line-strong bg-surface-2 px-3 text-sm text-content outline-none transition-colors duration-120 placeholder:text-content-disabled focus:border-accent focus:ring-2 focus:ring-accent-soft"
              />
              <IconButton
                label={t("send")}
                variant="soft"
                size="lg"
                onClick={() => void send()}
                disabled={!input.trim() || typing}
                className="bg-accent text-accent-content hover:bg-accent-hover hover:text-accent-content"
              >
                <SendHorizonal />
              </IconButton>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
