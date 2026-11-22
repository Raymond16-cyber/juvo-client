"use client";

import Button from "@/components/ui/Button";
import ChartTooltip from "@/components/ui/ChartTooltip";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { formatCompactMoney } from "@/lib/format";
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
      className="dashboard-card overflow-hidden rounded-card border border-border bg-card p-4 sm:p-5"
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
        <SegmentedControl
          ariaLabel="Performance range"
          value={range}
          onChange={setRange}
          options={[
            { value: "7D", label: "7D" },
            { value: "30D", label: "30D" },
            { value: "1Y", label: "1Y" },
          ]}
        />
      </div>

      {hasRealData ? (
        <div className="h-48 min-h-48 min-w-0 sm:h-72 sm:min-h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ left: -8, right: 2, top: 8, bottom: 0 }}
            >
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
                interval="preserveStartEnd"
                minTickGap={24}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={36}
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                tickFormatter={(value) =>
                  formatCompactMoney(Number(value), currency)
                }
              />
              <Tooltip
                cursor={{ stroke: "rgba(0,212,255,0.35)", strokeWidth: 1 }}
                content={
                  <ChartTooltip
                    currency={currency}
                    valueLabel="Cumulative P/L"
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="equity"
                name="Cumulative P/L"
                stroke="#00D4FF"
                strokeWidth={2.5}
                fill="url(#equityGradient)"
                activeDot={{ r: 5, stroke: "#00D4FF", strokeWidth: 2, fill: "#0B1220" }}
                isAnimationActive
                animationDuration={600}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex min-h-56 flex-col items-start justify-center rounded-card border border-dashed border-border bg-slate-50/80 px-5 py-8 dark:bg-white/[0.02] sm:min-h-72">
          <span className="grid h-10 w-10 place-items-center rounded-control border border-border bg-card text-slate-500">
            <LineChart size={18} />
          </span>
          <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">
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
