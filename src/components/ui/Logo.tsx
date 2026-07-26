import { useId } from "react";
import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#34d399" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M11 4.5 H21 L26.5 12 L16 27.5 L5.5 12 Z" fill={`url(#${id})`} />
      <g
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.9"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M5.5 12 H26.5" />
        <path d="M11 4.5 L13.8 12 L16 27.5" />
        <path d="M21 4.5 L18.2 12 L16 27.5" />
      </g>
    </svg>
  );
}

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex select-none items-center gap-2", className)}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-[17px] font-bold leading-none">
          Crypto<span className="text-accent">Casino</span>
        </span>
      )}
    </span>
  );
}
