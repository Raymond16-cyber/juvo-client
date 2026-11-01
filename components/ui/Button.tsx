"use client";

import { motion } from "framer-motion";
import React from "react";

type ButtonProps = React.ComponentPropsWithoutRef<typeof motion.button> & {
  variant?: "primary" | "ghost" | "onDark";
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 sm:px-5";

  const variants: Record<string, string> = {
    primary:
      "bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-500 text-slate-950 shadow-[0_12px_30px_rgba(56,189,248,0.25)] hover:-translate-y-0.5 hover:from-cyan-300 hover:to-violet-400",
    ghost:
      "border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-violet-500/10",
    onDark:
      "border border-white/10 bg-white/5 text-white hover:-translate-y-0.5 hover:bg-white/10",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`${base} ${variants[variant]} ${className}`.trim()}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
