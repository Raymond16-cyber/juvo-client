"use client";

import { formatCompactMoney, formatMoney } from "@/lib/format";
import { AnalyticsData } from "@/types/analytics.types";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Range = "7D" | "30D" | "1Y";

type PerformanceChartProps = {
  curve?: AnalyticsData["equityCurve"];
  currency?: string;
};

export default function PerformanceChart({
  curve = [],
  currency = "USD",
}: PerformanceChartProps) {
  const [range, setRange] = useState<Range>("7D");

  const data = useMemo(() => {
    const sliced =
      range === "7D"
        ? curve.slice(-7)
        : range === "30D"
          ? curve.slice(-30)
          : curve;
    return sliced.length
      ? sliced
      : [{ label: "Start", equity: 0, pnl: 0, trades: 0, date: new Date().toISOString() }];
  }, [curve, range]);

  return (
    <section
      data-dashboard-card
      className="dashboard-card overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-card sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Equity Curve
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            Journaled Performance
          </h2>
        </div>
        <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-bold dark:border-white/10 dark:bg-white/[0.04]">
          {(["7D", "30D", "1Y"] as Range[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={`rounded-full px-3 py-1.5 ${
                range === item
                  ? "bg-slate-950 text-white dark:bg-primary dark:text-slate-950"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 min-h-56 sm:h-80 sm:min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCompactMoney(Number(value), currency)}
              width={48}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: 16,
                background: "var(--card)",
                color: "var(--text)",
              }}
              formatter={(value) => [
                formatMoney(Number(value ?? 0), currency),
                "Cumulative P/L",
              ]}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="#00D4FF"
              strokeWidth={3}
              fill="url(#equityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
