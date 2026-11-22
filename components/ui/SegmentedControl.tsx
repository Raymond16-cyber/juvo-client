"use client";

import { cn } from "@/lib/ui";
import { interactionTransition } from "@/lib/motion";
import { motion } from "framer-motion";
import { useId } from "react";

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: Array<SegmentedOption<T>>;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
  ariaLabel?: string;
};

export default function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
  size = "sm",
  ariaLabel = "Segmented control",
}: SegmentedControlProps<T>) {
  const layoutId = useId();

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative inline-flex rounded-control border border-border bg-slate-50 p-1 dark:bg-white/[0.04]",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative z-10 min-w-0 rounded-[calc(var(--radius-control)-2px)] px-2.5 font-semibold transition-colors disabled:opacity-40",
              size === "sm" ? "min-h-8 py-1.5 text-xs" : "min-h-10 px-3 py-2 text-sm",
              selected
                ? "text-white dark:text-slate-950"
                : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            {selected ? (
              <motion.span
                layoutId={`segmented-${layoutId}`}
                className="absolute inset-0 -z-10 rounded-[calc(var(--radius-control)-2px)] bg-slate-950 dark:bg-primary"
                transition={interactionTransition(0.2)}
              />
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
