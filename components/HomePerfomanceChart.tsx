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

const data = [
  { day: "1", pnl: 120 },
  { day: "2", pnl: 80 },
  { day: "3", pnl: 240 },
  { day: "4", pnl: 180 },
  { day: "5", pnl: 310 },
  { day: "6", pnl: 270 },
  { day: "7", pnl: 420 },
  { day: "8", pnl: 380 },
  { day: "9", pnl: 510 },
  { day: "10", pnl: 460 },
  { day: "11", pnl: 590 },
  { day: "12", pnl: 680 },
];

export default function PerformanceChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} key="juvo-performance-chart">
        <defs>
          <linearGradient id="pnlGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />

        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 12 }}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#64748b", fontSize: 12 }}
        />

        <Tooltip
          contentStyle={{
            background: "#0b1220",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "10px",
            color: "#fff",
          }}
          formatter={(value) => [`$${value}`, "P/L"]}
          labelFormatter={(label) => `Day ${label}`}
        />

        <Area
          type="monotone"
          dataKey="pnl"
          stroke="#22d3ee"
          strokeWidth={3}
          fill="url(#pnlGradient)"
          dot={false}
          activeDot={{ r: 5 }}
          isAnimationActive
          animationBegin={0}
          animationDuration={1400}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
