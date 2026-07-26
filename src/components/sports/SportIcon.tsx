import { Gamepad2, Swords, Volleyball, type LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";

function StrokeIcon({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function FootballIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5 16 10.4 14.5 15h-5L8 10.4Z" strokeWidth="1.6" />
      <path d="M12 3v4.5M16 10.4l4.2-1.3M14.5 15l2.6 3.8M9.5 15l-2.6 3.8M8 10.4 3.8 9.1" strokeWidth="1.6" />
    </StrokeIcon>
  );
}

function BasketballIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3v18" strokeWidth="1.6" />
      <path d="M5.6 5.6c3.5 3.5 3.5 9.3 0 12.8M18.4 5.6c-3.5 3.5-3.5 9.3 0 12.8" strokeWidth="1.6" />
    </StrokeIcon>
  );
}

function TennisIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.5 5.5c3 2.5 3 10.5 0 13M18.5 5.5c-3 2.5-3 10.5 0 13" strokeWidth="1.6" />
    </StrokeIcon>
  );
}

function HockeyIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <path d="M4 3l6.5 12M20 3l-6.5 12" />
      <path d="M9.2 17.5h5.6" strokeWidth="1.6" />
      <ellipse cx="12" cy="20" rx="4.5" ry="1.8" />
    </StrokeIcon>
  );
}

function TableTennisIcon({ className }: { className?: string }) {
  return (
    <StrokeIcon className={className}>
      <circle cx="10.5" cy="10" r="6.5" />
      <path d="M15 15l4.5 4.5" strokeWidth="2.4" />
      <circle cx="19" cy="7" r="1.6" fill="currentColor" stroke="none" />
    </StrokeIcon>
  );
}

const ICONS: Record<string, React.ComponentType<{ className?: string } & Partial<LucideProps>>> = {
  football: FootballIcon,
  basketball: BasketballIcon,
  tennis: TennisIcon,
  hockey: HockeyIcon,
  esports: Gamepad2,
  mma: Swords,
  volleyball: Volleyball,
  "table-tennis": TableTennisIcon,
};

export function SportIcon({ sport, className }: { sport: string; className?: string }) {
  const Icon = ICONS[sport] ?? FootballIcon;
  return <Icon className={cn("size-[18px]", className)} />;
}
