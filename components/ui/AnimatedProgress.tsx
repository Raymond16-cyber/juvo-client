"use client";

import { panelTransition } from "@/lib/motion";
import { motion } from "framer-motion";

type AnimatedProgressProps = {
  value: number;
  className?: string;
};

export default function AnimatedProgress({
  value,
  className = "h-full rounded-full bg-primary",
}: AnimatedProgressProps) {
  return (
    <motion.div
      data-progress-bar
      className={className}
      initial={false}
      animate={{ width: `${value}%` }}
      transition={panelTransition}
    />
  );
}
