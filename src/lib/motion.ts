import type { Transition, Variants } from "framer-motion";

/** Duration scale, seconds. micro = hover/press, ui = dropdowns/toasts, structural = modals/drawers. */
export const DUR = {
  micro: 0.12,
  ui: 0.2,
  structural: 0.3,
} as const;

export const EASE_STANDARD = [0.2, 0.8, 0.2, 1] as const;

export const transitionUi: Transition = { duration: DUR.ui, ease: EASE_STANDARD };
export const transitionStructural: Transition = { duration: DUR.structural, ease: EASE_STANDARD };

export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const fadeScale: Variants = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export const slideUp: Variants = {
  initial: { y: "100%" },
  animate: { y: 0 },
  exit: { y: "100%" },
};

export const slideRight: Variants = {
  initial: { x: "100%" },
  animate: { x: 0 },
  exit: { x: "100%" },
};
