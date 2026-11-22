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
      className="dashboard-card min-h-[5.75rem] min-w-0 rounded-card border border-border bg-card p-3 sm:min-h-[6.25rem] sm:p-3.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-muted sm:text-[11px]">
            {label}
          </p>
          <p className="juvo-break-words mt-1.5 text-lg font-semibold tabular-nums leading-tight text-slate-950 dark:text-white sm:text-xl">
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
            "grid h-8 w-8 shrink-0 place-items-center rounded-control",
            iconTone,
          )}
        >
          <Icon size={15} />
        </div>
      </div>
      <div className="mt-2 flex items-start justify-between gap-2 sm:items-center">
        <p className={cn("min-w-0 text-[11px] font-medium leading-4 sm:text-xs", toneClass)}>
          {change}
        </p>
        {onExplain ? (
          <button
            type="button"
            onClick={onExplain}
            className="shrink-0 py-0.5 text-[11px] font-semibold text-primary transition hover:underline"
          >
            {explainLabel}
          </button>
        ) : null}
      </div>
    </section>
  );
}
