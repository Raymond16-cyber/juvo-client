"use client";

import { formatMoney } from "@/lib/format";

type ChartTooltipPayloadItem = {
  value?: number | string | null;
  name?: string;
  color?: string;
  dataKey?: string | number;
};

type ChartTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: ChartTooltipPayloadItem[];
  currency?: string;
  valueLabel?: string;
  formatValue?: (value: number) => string;
};

/** Shared Recharts tooltip shell used by interactive analytics charts. */
export default function ChartTooltip({
  active,
  label,
  payload,
  currency = "USD",
  valueLabel = "Value",
  formatValue,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const primary = payload[0];
  const numeric = Number(primary?.value ?? 0);
  const display =
    formatValue?.(numeric) ??
    (Number.isFinite(numeric) ? formatMoney(numeric, currency) : String(primary?.value ?? "—"));

  return (
    <div className="min-w-[9.5rem] rounded-control border border-border bg-card px-3 py-2.5 shadow-juvo">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {primary?.name || valueLabel}
        </span>
        <span className="text-sm font-semibold tabular-nums text-slate-950 dark:text-white">
          {display}
        </span>
      </div>
      {payload.length > 1
        ? payload.slice(1).map((item) => {
            const value = Number(item.value ?? 0);
            const text =
              formatValue?.(value) ??
              (Number.isFinite(value)
                ? formatMoney(value, currency)
                : String(item.value ?? "—"));
            return (
              <div
                key={String(item.dataKey ?? item.name)}
                className="mt-1 flex items-baseline justify-between gap-3"
              >
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {item.name}
                </span>
                <span className="text-sm font-semibold tabular-nums text-slate-950 dark:text-white">
                  {text}
                </span>
              </div>
            );
          })
        : null}
    </div>
  );
}
