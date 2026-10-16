"use client";

import { cardClassName, cn } from "@/lib/ui";
import { panelTransition } from "@/lib/motion";
import { motion } from "framer-motion";

type CardProps = {
  children: React.ReactNode;
  id?: string;
  className?: string;
  interactive?: boolean;
};

export default function Card({
  id,
  children,
  className,
  interactive = true,
}: CardProps) {
  return (
    <motion.section
      id={id}
      className={cn(
        cardClassName,
        interactive &&
          "transition-colors hover:border-primary/35 hover:shadow-lg hover:shadow-slate-200/60 dark:hover:shadow-black/30",
        className,
      )}
      whileHover={interactive ? { y: -2 } : undefined}
      transition={panelTransition}
    >
      {children}
    </motion.section>
  );
}
