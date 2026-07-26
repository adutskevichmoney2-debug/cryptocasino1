import {
  Dice5,
  Trophy,
  Gift,
  Crown,
  Flame,
  ShieldCheck,
  LifeBuoy,
  Star,
  History,
  Spade,
  Radio,
  Clapperboard,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Messages } from "next-intl";

type NavKey = keyof Messages["nav"];

export interface NavLink {
  /** Key inside the `nav` translation namespace. */
  key: NavKey;
  href: string;
  icon: LucideIcon;
  /** Requires an authenticated session. */
  auth?: boolean;
}

export interface NavSection {
  /** Section heading key inside the `nav` namespace, or null for an unlabeled group. */
  titleKey: NavKey | null;
  links: NavLink[];
}

export const SIDEBAR_SECTIONS: NavSection[] = [
  {
    titleKey: null,
    links: [
      { key: "casino", href: "/casino", icon: Dice5 },
      { key: "sports", href: "/sports", icon: Trophy },
      { key: "promotions", href: "/promotions", icon: Gift },
      { key: "vip", href: "/vip", icon: Crown },
      { key: "leaderboard", href: "/leaderboard", icon: Flame },
    ],
  },
  {
    titleKey: "games",
    links: [
      { key: "slots", href: "/casino/category/slots", icon: Sparkles },
      { key: "live", href: "/casino/category/live", icon: Radio },
      { key: "gameShows", href: "/casino/category/game-shows", icon: Clapperboard },
      { key: "originals", href: "/casino/category/originals", icon: Zap },
      { key: "table", href: "/casino/category/table", icon: Spade },
    ],
  },
  {
    titleKey: "profile",
    links: [
      { key: "favorites", href: "/casino/favorites", icon: Star, auth: true },
      { key: "recent", href: "/casino/recent", icon: History, auth: true },
    ],
  },
  {
    titleKey: null,
    links: [
      { key: "provablyFair", href: "/provably-fair", icon: ShieldCheck },
      { key: "help", href: "/help", icon: LifeBuoy },
    ],
  },
];

export const FOOTER_SECTIONS: {
  titleKey: keyof Messages["footer"];
  links: { key: NavKey; href: string }[];
}[] = [
  {
    titleKey: "casino",
    links: [
      { key: "slots", href: "/casino/category/slots" },
      { key: "live", href: "/casino/category/live" },
      { key: "gameShows", href: "/casino/category/game-shows" },
      { key: "originals", href: "/casino/category/originals" },
    ],
  },
  {
    titleKey: "sports",
    links: [
      { key: "sportsbook", href: "/sports" },
      { key: "liveNow", href: "/sports/live" },
      { key: "leaderboard", href: "/leaderboard" },
      { key: "promotions", href: "/promotions" },
    ],
  },
  {
    titleKey: "about",
    links: [
      { key: "vip", href: "/vip" },
      { key: "provablyFair", href: "/provably-fair" },
      { key: "help", href: "/help" },
      { key: "support", href: "/help/contact" },
    ],
  },
];
