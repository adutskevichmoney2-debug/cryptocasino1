"use client";

import { useTranslations } from "next-intl";
import { LogoMark } from "@/components/ui/Logo";
import { Badge } from "@/components/ui/Badge";
import type { Game } from "@/services/types";

/**
 * The playing surface.
 *
 * INTEGRATION POINT: with a licensed game provider, `game.launchUrl` holds the
 * per-session launch URL returned by the provider's API — the iframe branch
 * below renders it and nothing else changes. Until then the branded
 * placeholder is shown.
 */
export function GameFrame({ game, mode }: { game: Game; mode: "real" | "demo" }) {
  const t = useTranslations("casino");
  const tCommon = useTranslations("common");

  if (game.launchUrl) {
    return (
      <iframe
        src={game.launchUrl}
        title={game.title}
        allow="autoplay; fullscreen"
        className="aspect-video w-full rounded-xl border border-line bg-black"
      />
    );
  }

  return (
    <div
      className="relative flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-line bg-surface-1 px-6 text-center"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="absolute right-3 top-3">
        <Badge variant={mode === "real" ? "accent" : "neutral"}>
          {mode === "real" ? t("realMode") : t("demoMode")}
        </Badge>
      </div>

      <LogoMark className="size-12 opacity-90" />
      <p className="font-display text-lg font-bold text-content">{t("placeholderTitle")}</p>
      <p className="max-w-[520px] text-[13px] leading-relaxed text-content-tertiary">
        {t("placeholderText")}
      </p>
      <Badge variant="outline">{tCommon("demo")} · {t("demoBadgeHint")}</Badge>
    </div>
  );
}
