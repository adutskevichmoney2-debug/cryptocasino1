import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Brand mark: a brilliant-cut emerald. Each facet is shaded separately
 * (light source top-left) for a jewellery-grade look at any size.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 48 48" className={cn("size-7", className)} aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-table`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#8df2cd" />
          <stop offset="1" stopColor="#2fd9a0" />
        </linearGradient>
      </defs>

      <ellipse cx="24" cy="25" rx="21" ry="20" fill={`url(#${id}-glow)`} />

      {/* Crown */}
      <path d="M17 9 L7 21 L15 21 Z" fill="#4ae5ab" />
      <path d="M17 9 L15 21 L24 21 Z" fill="#36dc9e" />
      <path d="M17 9 L24 21 L31 9 Z" fill={`url(#${id}-table)`} />
      <path d="M31 9 L24 21 L33 21 Z" fill="#17c689" />
      <path d="M31 9 L33 21 L41 21 Z" fill="#0da372" />

      {/* Pavilion */}
      <path d="M7 21 L15 21 L24 42 Z" fill="#079567" />
      <path d="M15 21 L24 21 L24 42 Z" fill="#10b981" />
      <path d="M24 21 L33 21 L24 42 Z" fill="#0a8a61" />
      <path d="M33 21 L41 21 L24 42 Z" fill="#056148" />

      {/* Specular highlight on the table */}
      <path d="M19 10.5 L27.5 10.5 L22.5 14.5 Z" fill="#ffffff" opacity="0.4" />

      {/* Hairline edges */}
      <g stroke="#04120d" strokeOpacity="0.25" strokeWidth="0.6" fill="none" strokeLinejoin="round">
        <path d="M7 21 H41" />
        <path d="M17 9 L15 21 L24 42" />
        <path d="M31 9 L33 21 L24 42" />
        <path d="M17 9 L24 21 L31 9" />
        <path d="M24 21 L24 42" />
      </g>
      <path
        d="M17 9 H31 L41 21 L24 42 L7 21 Z"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex select-none items-center gap-2", className)}>
      <LogoMark />
      {!compact && (
        <span className="font-display text-[17px] font-extrabold leading-none tracking-tight">
          <span className="text-content">Crypto</span>
          <span className="bg-gradient-to-r from-[#4ae5ab] to-[#0d9f74] bg-clip-text text-transparent">
            Casino
          </span>
        </span>
      )}
    </span>
  );
}
