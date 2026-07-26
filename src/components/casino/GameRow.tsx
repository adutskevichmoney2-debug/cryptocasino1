"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { GameCard } from "./GameCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { IconButton } from "@/components/ui/IconButton";
import type { Game } from "@/services/types";

/** Horizontally scrollable game strip with arrow controls, Stake-lobby style. */
export function GameRow({ games, loading }: { games: Game[]; loading?: boolean }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = () => {
    const el = scroller.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  const scrollBy = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-[calc((100%-2.25rem)/4)] shrink-0 rounded-xl sm:w-[calc((100%-3rem)/5)] xl:w-[calc((100%-3.75rem)/6)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="group/row relative">
      <div
        ref={scroller}
        onScroll={updateArrows}
        className="no-scrollbar flex snap-x gap-3 overflow-x-auto scroll-smooth"
      >
        {games.map((game) => (
          <div
            key={game.id}
            className="w-[calc((100%-1.5rem)/3)] shrink-0 snap-start sm:w-[calc((100%-2.25rem)/4)] md:w-[calc((100%-3rem)/5)] xl:w-[calc((100%-3.75rem)/6)]"
          >
            <GameCard game={game} />
          </div>
        ))}
      </div>

      {canLeft && (
        <IconButton
          label="Scroll left"
          variant="soft"
          onClick={() => scrollBy(-1)}
          className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 border border-line shadow-dropdown max-lg:hidden"
        >
          <ChevronLeft />
        </IconButton>
      )}
      {canRight && games.length > 4 && (
        <IconButton
          label="Scroll right"
          variant="soft"
          onClick={() => scrollBy(1)}
          className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 border border-line shadow-dropdown max-lg:hidden"
        >
          <ChevronRight />
        </IconButton>
      )}
    </div>
  );
}
