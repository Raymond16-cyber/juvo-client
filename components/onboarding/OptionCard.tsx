"use client";

import { Check } from "lucide-react";

interface OptionCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  multiple?: boolean;
}

export default function OptionCard({
  label,
  description,
  selected,
  onClick,
  multiple = false,
}: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`relative w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-primary bg-primary/10 shadow-sm shadow-primary/10"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 dark:hover:bg-white/[0.05]"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-slate-950 dark:text-white">{label}</p>

          {description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>

        {selected && (
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary">
            <span className="sr-only">
              {multiple ? "Selected option" : "Selected"}
            </span>
            <Check className="h-3 w-3 text-slate-950" />
          </div>
        )}
      </div>
    </button>
  );
}
