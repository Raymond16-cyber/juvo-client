"use client";

import PerformanceChart from "@/components/dashboard/PerformanceChart";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { formatMoney, formatNumber, pnlClass } from "@/lib/format";
import { useAnalyticsStore } from "@/stores/analytics.store";
import { BarChart3 } from "lucide-react";
import { useEffect } from "react";

export default function AnalyticsPage() {
  const data = useAnalyticsStore((state) => state.data);
  const isLoading = useAnalyticsStore((state) => state.isLoading);
  const fetchAnalytics = useAnalyticsStore((state) => state.fetchAnalytics);

  useEffect(() => {
    fetchAnalytics().catch(() => undefined);
  }, [fetchAnalytics]);

  const summary = data?.summary;

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analytics"
          title="Performance Review"
          description="Built from your journals, not a demo equity curve. Empty numbers mean the work has not been logged yet."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Net P/L", formatMoney(summary?.netPnl || 0), pnlClass(summary?.netPnl || 0)],
            ["Win rate", `${formatNumber(summary?.winRate || 0, 1)}%`, ""],
            ["Avg RR", formatNumber(summary?.avgRr || 0), ""],
            ["Avg risk", `${formatNumber(summary?.avgRisk || 0, 1)}%`, ""],
          ].map(([label, value, tone]) => (
            <Card key={label} className="p-5">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                {label}
              </p>
              <p className={`mt-3 text-3xl font-bold ${tone || "text-slate-950 dark:text-white"}`}>
                {value}
              </p>
            </Card>
          ))}
        </div>

        <PerformanceChart curve={data?.equityCurve} />

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">By symbol</h2>
            <div className="mt-4 space-y-3">
              {data?.bySymbol.length ? (
                data.bySymbol.map((item) => (
                  <div
                    key={item.symbol}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/[0.04]"
                  >
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">{item.symbol}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.trades} trades · {item.winRate}% win
                      </p>
                    </div>
                    <p className={`font-bold ${pnlClass(item.pnl)}`}>{formatMoney(item.pnl)}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title={isLoading ? "Loading" : "No symbol data"}
                  body="Log closed trades to see where the edge actually lives."
                />
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">By session</h2>
            <div className="mt-4 space-y-3">
              {data?.bySession.length ? (
                data.bySession.map((item) => (
                  <div
                    key={item.session}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/[0.04]"
                  >
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">{item.session}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.trades} trades · {item.winRate}% win
                      </p>
                    </div>
                    <p className={`font-bold ${pnlClass(item.pnl)}`}>{formatMoney(item.pnl)}</p>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title={isLoading ? "Loading" : "No session tags"}
                  body="Tag London, New York, Tokyo, or Asia when you log a trade."
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
