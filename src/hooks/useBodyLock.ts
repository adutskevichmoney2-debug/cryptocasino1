"use client";

import { useEffect } from "react";

let lockCount = 0;

/** Locks body scroll while `locked` is true. Ref-counted for stacked modals. */
export function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    lockCount++;
    const prevOverflow = document.body.style.overflow;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      lockCount--;
      if (lockCount === 0) {
        document.body.style.overflow = prevOverflow;
        document.body.style.paddingRight = "";
      }
    };
  }, [locked]);
}
