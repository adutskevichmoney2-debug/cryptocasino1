import { hashString } from "@/lib/rng";
import { cn } from "@/lib/cn";

/**
 * Deterministic generated cover art — no binary assets, no third-party
 * artwork. Gradient, pattern and typography derive from the game slug, so
 * every game keeps a stable, unique look.
 */

const GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ["#065f46", "#022c22"],
  ["#1e3a8a", "#0c1a4b"],
  ["#5b21b6", "#2e1065"],
  ["#9d174d", "#500724"],
  ["#92400e", "#451a03"],
  ["#155e75", "#083344"],
  ["#3f6212", "#1a2e05"],
  ["#86198f", "#4a044e"],
  ["#075985", "#082f49"],
  ["#9a3412", "#431407"],
  ["#115e59", "#042f2e"],
  ["#3730a3", "#1e1b4b"],
];

const ACCENTS = [
  "#34d399",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
  "#22d3ee",
  "#a3e635",
  "#e879f9",
  "#38bdf8",
  "#fb923c",
  "#2dd4bf",
  "#818cf8",
];

function Pattern({ variant, accent }: { variant: number; accent: string }) {
  switch (variant) {
    case 0:
      return (
        <g stroke={accent} strokeOpacity="0.25" strokeWidth="1.5" fill="none">
          <circle cx="75" cy="20" r="28" />
          <circle cx="75" cy="20" r="40" />
          <circle cx="10" cy="105" r="22" />
          <circle cx="10" cy="105" r="34" />
        </g>
      );
    case 1:
      return (
        <g fill={accent} fillOpacity="0.2">
          <path d="M50 -10 L95 35 L50 80 L5 35 Z" />
          <path d="M50 55 L85 90 L50 125 L15 90 Z" fillOpacity="0.12" />
        </g>
      );
    case 2:
      return (
        <g stroke={accent} strokeOpacity="0.22" strokeWidth="10">
          <line x1="-10" y1="30" x2="110" y2="-15" />
          <line x1="-10" y1="70" x2="110" y2="25" />
          <line x1="-10" y1="110" x2="110" y2="65" />
          <line x1="-10" y1="150" x2="110" y2="105" />
        </g>
      );
    default:
      return (
        <g fill={accent} fillOpacity="0.18">
          <circle cx="20" cy="25" r="4" />
          <circle cx="55" cy="12" r="6" />
          <circle cx="85" cy="40" r="5" />
          <circle cx="30" cy="70" r="7" />
          <circle cx="75" cy="85" r="4" />
          <circle cx="15" cy="110" r="5" />
          <circle cx="60" cy="118" r="6" />
        </g>
      );
  }
}

export function GameThumb({
  slug,
  title,
  providerName,
  className,
}: {
  slug: string;
  title: string;
  providerName?: string;
  className?: string;
}) {
  const hash = hashString(slug);
  const [from, to] = GRADIENTS[hash % GRADIENTS.length];
  const accent = ACCENTS[(hash >> 4) % ACCENTS.length];
  const pattern = (hash >> 8) % 4;
  const initial = title[0]?.toUpperCase() ?? "?";

  return (
    <div
      className={cn("relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-xl", className)}
      style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}
    >
      <svg viewBox="0 0 100 133" className="absolute inset-0 size-full" aria-hidden="true">
        <Pattern variant={pattern} accent={accent} />
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontSize="58"
          fontWeight="800"
          fill="white"
          fillOpacity="0.14"
          fontFamily="var(--font-manrope), sans-serif"
        >
          {initial}
        </text>
      </svg>

      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent"
        aria-hidden="true"
      />

      <div className="relative mt-auto flex flex-col gap-0.5 p-2.5">
        <p className="font-display text-[13px] font-bold leading-tight text-white [text-shadow:0_1px_2px_rgba(0,0,0,.5)]">
          {title}
        </p>
        {providerName && (
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/55">
            {providerName}
          </p>
        )}
      </div>
    </div>
  );
}
