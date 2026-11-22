import type { Transition, Variants } from "framer-motion";

export const juvoEase = [0.22, 1, 0.36, 1] as const;

export const motionDuration = {
  fast: 0.16,
  normal: 0.24,
  slow: 0.38,
};

/** Prefer CSS/instant transitions when the user requests reduced motion. */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function interactionTransition(
  duration = motionDuration.normal,
): Transition {
  if (prefersReducedMotion()) {
    return { duration: 0 };
  }
  return { duration, ease: juvoEase };
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 2 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
};

export const panelTransition = {
  duration: motionDuration.normal,
  ease: juvoEase,
};

export const dropdownTransition = {
  duration: 0.18,
  ease: juvoEase,
};

export const subtleListContainer: Variants = {
  hidden: {},
  shown: {
    transition: {
      staggerChildren: 0.025,
    },
  },
};

export const subtleListItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  shown: { opacity: 1, y: 0 },
};
