import { cn } from "@/lib/cn";

/** 12 preset avatar gradients. Users pick one in profile settings — no binary assets. */
export const AVATAR_GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ["#34d399", "#059669"],
  ["#60a5fa", "#2563eb"],
  ["#a78bfa", "#7c3aed"],
  ["#f472b6", "#db2777"],
  ["#fbbf24", "#d97706"],
  ["#22d3ee", "#0891b2"],
  ["#a3e635", "#65a30d"],
  ["#e879f9", "#c026d3"],
  ["#38bdf8", "#0284c7"],
  ["#fb923c", "#ea580c"],
  ["#2dd4bf", "#0d9488"],
  ["#818cf8", "#4f46e5"],
];

const SIZES = {
  xs: "size-6 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
} as const;

export function Avatar({
  nickname,
  avatarId = 0,
  size = "md",
  className,
}: {
  nickname?: string;
  avatarId?: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const [from, to] = AVATAR_GRADIENTS[Math.abs(avatarId) % AVATAR_GRADIENTS.length];
  const initial = (nickname?.trim()[0] ?? "?").toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-display font-bold text-white/95",
        SIZES[size],
        className,
      )}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
