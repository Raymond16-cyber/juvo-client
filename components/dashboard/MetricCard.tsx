"use client";

import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { LucideIcon } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  tone: "profit" | "loss" | "neutral";
  icon: LucideIcon;
};

function getCounterConfig(value: string) {
  const numericValue = Number(value.replace(/[^0-9.-]/g, ""));
  const suffix = value.endsWith("%") ? "%" : "";
  const prefix = value.includes("$") ? "$" : "";
  const sign = value.trim().startsWith("+") ? "+" : "";

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return {
    value: numericValue,
    formatter: (next: number) =>
      `${sign}${prefix}${Math.round(next).toLocaleString()}${suffix}`,
  };
}

export default function MetricCard({
  label,
  value,
  change,
  tone,
  icon: Icon,
}: MetricCardProps) {
  const counter = getCounterConfig(value);
  const toneClass = {
    profit: "text-emerald-600 dark:text-emerald-400",
    loss: "text-rose-600 dark:text-rose-400",
    neutral: "text-slate-500 dark:text-slate-400",
  }[tone];

  return (
    <section
      data-dashboard-card
      className="dashboard-card rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/70 dark:border-white/10 dark:bg-card dark:hover:shadow-black/30 sm:min-h-40 sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-2xl font-bold leading-none text-slate-950 dark:text-white sm:mt-4 sm:text-3xl">
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
        <div className="pulse-profit grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-primary">
          <Icon size={20} />
        </div>
      </div>
      <p className={`mt-4 text-sm font-semibold sm:mt-6 ${toneClass}`}>{change}</p>
    </section>
  );
}
