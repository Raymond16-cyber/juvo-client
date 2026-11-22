"use client";

import { cn } from "@/lib/ui";
import { motion } from "framer-motion";
import { interactionTransition } from "@/lib/motion";

type SwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  id?: string;
  className?: string;
};

export default function Switch({
  checked,
  onChange,
  disabled = false,
  label,
  description,
  id,
  className,
}: SwitchProps) {
  const switchId = id || `switch-${label?.replace(/\s+/g, "-").toLowerCase() || "control"}`;

  return (
    <button
      type="button"
      id={switchId}
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-center justify-between gap-3 text-left disabled:opacity-50",
        className,
      )}
    >
      {(label || description) && (
        <span className="min-w-0">
          {label ? (
            <span className="block text-sm font-semibold text-slate-950 dark:text-white">
              {label}
            </span>
          ) : null}
          {description ? (
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              {description}
            </span>
          ) : null}
        </span>
      )}
      <span
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition-colors",
          checked ? "bg-primary" : "bg-slate-300 dark:bg-white/20",
        )}
      >
        <motion.span
          className="block h-5 w-5 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={interactionTransition(0.18)}
        />
      </span>
    </button>
  );
}
