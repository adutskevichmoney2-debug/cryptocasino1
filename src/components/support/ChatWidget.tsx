"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Headset, SendHorizonal, X } from "lucide-react";
import { services } from "@/services";
import { useUiStore } from "@/stores/uiStore";
import { useMounted } from "@/hooks/useMounted";
import { IconButton } from "@/components/ui/IconButton";
import { LogoMark } from "@/components/ui/Logo";
import { fadeUp, transitionStructural } from "@/lib/motion";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "@/services/types";

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
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    void services.support.getChatHistory().then(setMessages);
  }, [open]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setInput("");

    const userMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      from: "user",
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setTyping(true);

    const reply = await services.support.sendChatMessage(locale, text);
    setTyping(false);
    setMessages((prev) => [...prev, reply]);
  };

  if (!mounted) return null;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("open")}
          className="fixed bottom-4 right-4 z-[80] flex size-12 cursor-pointer items-center justify-center rounded-full bg-accent text-accent-content shadow-raised transition-transform duration-120 hover:scale-105 max-lg:bottom-[calc(72px+env(safe-area-inset-bottom))]"
        >
          <Headset className="size-5" />
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

            <div ref={scroller} className="flex-1 space-y-2.5 overflow-y-auto p-4">
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
