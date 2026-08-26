"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const performanceData = [
  { day: "Mon", equity: 101200 },
  { day: "Tue", equity: 102450 },
  { day: "Wed", equity: 101900 },
  { day: "Thu", equity: 104800 },
  { day: "Fri", equity: 106250 },
  { day: "Sat", equity: 105900 },
  { day: "Sun", equity: 108420 },
];

export default function PerformanceChart() {
  return (
    <section className="dashboard-card rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Equity Curve
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            Weekly Performance
          </h2>
        </div>
        <div className="flex rounded-full border border-slate-200 bg-slate-50 p-1 text-xs font-bold dark:border-white/10 dark:bg-white/[0.04]">
          <button className="rounded-full bg-slate-950 px-3 py-1.5 text-white dark:bg-primary dark:text-slate-950">
            7D
          </button>
          <button className="px-3 py-1.5 text-slate-500 dark:text-slate-400">
            30D
          </button>
          <button className="px-3 py-1.5 text-slate-500 dark:text-slate-400">
            1Y
          </button>
        </div>
      </div>

      <div className="h-80 min-h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={performanceData} margin={{ left: 0, right: 0 }}>
            <defs>
              <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${Number(value) / 1000}k`}
              width={48}
            />
            <Tooltip
              contentStyle={{
                border: "1px solid rgba(148,163,184,0.25)",
                borderRadius: 16,
                background: "#020617",
                color: "#fff",
              }}
              formatter={(value) => [
                `$${Number(value ?? 0).toLocaleString()}`,
                "Equity",
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
