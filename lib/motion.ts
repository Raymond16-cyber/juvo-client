import type { Variants } from "framer-motion";

export const juvoEase = [0.22, 1, 0.36, 1] as const;

export const motionDuration = {
  fast: 0.16,
  normal: 0.24,
  slow: 0.38,
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 4 },
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
