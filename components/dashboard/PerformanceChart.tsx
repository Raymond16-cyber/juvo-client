"use client";

import Button from "@/components/ui/Button";
import { formatCompactMoney, formatMoney } from "@/lib/format";
import { cn } from "@/lib/ui";
import { AnalyticsData } from "@/types/analytics.types";
import { LineChart } from "lucide-react";
import Link from "next/link";
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
  const hasRealData = curve.length > 0;

  const data = useMemo(() => {
    if (!hasRealData) return [];
    if (range === "7D") return curve.slice(-7);
    if (range === "30D") return curve.slice(-30);
    return curve;
  }, [curve, hasRealData, range]);

  return (
    <section
      data-dashboard-card
      className="dashboard-card overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-white/10 dark:bg-card sm:p-5"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Equity curve
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            Journaled performance
          </h2>
        </div>
        <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold dark:border-white/10 dark:bg-white/[0.04]">
          {(["7D", "30D", "1Y"] as Range[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRange(item)}
              className={cn(
                "rounded-lg px-3 py-1.5 transition",
                range === item
                  ? "bg-slate-950 text-white dark:bg-primary dark:text-slate-950"
                  : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {hasRealData ? (
        <div className="h-56 min-h-56 sm:h-72 sm:min-h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148,163,184,0.16)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                tickFormatter={(value) =>
                  formatCompactMoney(Number(value), currency)
                }
                width={56}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid rgba(148,163,184,0.25)",
                  borderRadius: 14,
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
                strokeWidth={2.5}
                fill="url(#equityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex min-h-56 flex-col items-start justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-8 dark:border-white/10 dark:bg-white/[0.03] sm:min-h-72">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary/15 text-primary">
            <LineChart size={18} />
          </span>
          <h3 className="mt-4 text-base font-bold text-slate-950 dark:text-white">
            Not enough journaled history yet
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Log closed trades in your daily journal to build a real equity curve.
            JUVO will never invent performance points.
          </p>
          <Link href="/home/journal" className="mt-4">
            <Button type="button" variant="ghost" className="h-10">
              Open journal
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
