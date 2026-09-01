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
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<string, string> = {
    primary:
      "bg-primary text-slate-950 shadow-[0_12px_30px_rgba(0,212,255,0.22)] hover:-translate-y-0.5 hover:bg-secondary",
    ghost:
      "border border-slate-200 bg-white text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/10",
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
