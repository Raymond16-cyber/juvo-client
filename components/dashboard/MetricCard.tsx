"use client";

import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { cn } from "@/lib/ui";
import { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  tone: "profit" | "loss" | "neutral";
  icon: LucideIcon;
  onExplain?: () => void;
  explainLabel?: string;
};

function getCounterConfig(value: string) {
  const trimmed = value.trim();
  const numericValue = Number(trimmed.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(numericValue)) {
    return null;
  }

  const suffix = trimmed.endsWith("%") ? "%" : "";
  const leadingSign = trimmed.startsWith("+")
    ? "+"
    : trimmed.startsWith("-")
      ? "-"
      : "";
  const unsigned = leadingSign ? trimmed.slice(1) : trimmed;
  const currencyPrefix = unsigned.match(/^[^0-9]+/)?.[0] ?? "";

  return {
    value: Math.abs(numericValue),
    formatter: (next: number) =>
      `${leadingSign}${currencyPrefix}${Math.round(Math.abs(next)).toLocaleString()}${suffix}`,
  };
}

export default function MetricCard({
  label,
  value,
  change,
  tone,
  icon: Icon,
  onExplain,
  explainLabel = "Explain",
}: MetricCardProps) {
  const counter = getCounterConfig(value);
  const toneClass = {
    profit: "text-emerald-600 dark:text-emerald-400",
    loss: "text-rose-600 dark:text-rose-400",
    neutral: "text-slate-500 dark:text-slate-400",
  }[tone];
  const iconTone = {
    profit: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    loss: "bg-rose-500/10 text-rose-600 dark:text-rose-300",
    neutral: "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300",
  }[tone];

  return (
    <section
      data-dashboard-card
      className="dashboard-card min-w-0 rounded-2xl border border-slate-200/90 bg-white p-3.5 dark:border-white/10 dark:bg-card sm:p-5"
    >
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 sm:text-xs">
            {label}
          </p>
          <p className="juvo-break-words mt-2 text-xl font-bold tabular-nums leading-tight text-slate-950 dark:text-white sm:mt-3 sm:text-2xl sm:leading-none">
            {counter ? (
              <AnimatedCounter
                value={counter.value}
                formatter={counter.formatter}
              />
            ) : (
              value
            )}
          </p>
        </div>
        <div
          className={cn(
            "grid h-9 w-9 shrink-0 place-items-center rounded-xl sm:h-10 sm:w-10",
            iconTone,
          )}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-2 sm:mt-4 sm:items-center sm:gap-3">
        <p className={cn("min-w-0 text-xs font-medium leading-5 sm:text-sm", toneClass)}>
          {change}
        </p>
        {onExplain ? (
          <button
            type="button"
            onClick={onExplain}
            className="shrink-0 py-1 text-xs font-semibold text-primary transition hover:underline"
          >
            {explainLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
