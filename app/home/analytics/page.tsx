"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { formatMoney, formatNumber, pnlClass } from "@/lib/format";
import { controlClassName } from "@/lib/ui";
import { useAccountsStore } from "@/stores/accounts.store";
import { useAnalyticsStore } from "@/stores/analytics.store";
import {
  Activity,
  BarChart3,
  Gauge,
  LineChart,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type MetricCardProps = {
  label: string;
  value: string;
  caption?: string;
  tone?: string;
  icon: typeof BarChart3;
};

const ALL_ACCOUNTS = "all";

function MetricCard({ label, value, caption, tone, icon: Icon }: MetricCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p
            className={`mt-3 break-words text-2xl font-bold sm:text-3xl ${
              tone || "text-slate-950 dark:text-white"
            }`}
          >
            {value}
          </p>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Icon size={18} />
        </div>
      </div>
      {caption ? (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {caption}
        </p>
      ) : null}
    </Card>
  );
}

function formatFactor(value?: number) {
  if (!value || value <= 0) return "0.00";
  return formatNumber(value, 2);
}

function directionLabel(direction: "long" | "short") {
  return direction === "long" ? "Long positions" : "Short positions";
}

export default function AnalyticsPage() {
  const data = useAnalyticsStore((state) => state.data);
  const isLoading = useAnalyticsStore((state) => state.isLoading);
  const fetchAnalytics = useAnalyticsStore((state) => state.fetchAnalytics);
  const accounts = useAccountsStore((state) => state.accounts);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const [accountFilter, setAccountFilter] = useState(ALL_ACCOUNTS);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account._id === accountFilter) || null,
    [accountFilter, accounts],
  );
  const summary = data?.summary;
  const currency =
    selectedAccount?.accountCurrency || selectedAccount?.currency || data?.currency || "USD";
  const filteredLabel = selectedAccount
    ? selectedAccount.accountName
    : "All accounts";
  const normalizedCurrency =
    data?.currencyMode === "normalized" && accountFilter === ALL_ACCOUNTS;
  const missingFx =
    Boolean(data?.conversionUnavailable) && accountFilter === ALL_ACCOUNTS;

  useEffect(() => {
    fetchAccounts().catch(() => undefined);
  }, [fetchAccounts]);

  useEffect(() => {
    fetchAnalytics(accountFilter === ALL_ACCOUNTS ? null : accountFilter).catch(
      () => undefined,
    );
  }, [accountFilter, fetchAnalytics]);

  const topMetrics = [
    {
      label: "All-time P/L",
      value: formatMoney(summary?.netPnl || 0, currency),
      caption: `${summary?.closedTrades || 0} closed trades`,
      tone: pnlClass(summary?.netPnl || 0),
      icon: LineChart,
    },
    {
      label: "Win rate",
      value: `${formatNumber(summary?.winRate || 0, 1)}%`,
      caption: `${summary?.wins || 0} wins / ${summary?.losses || 0} losses`,
      icon: ShieldCheck,
    },
    {
      label: "Profit factor",
      value: formatFactor(summary?.profitFactor),
      caption: `${formatMoney(summary?.grossProfit || 0, currency)} gross profit`,
      icon: Gauge,
    },
    {
      label: "Recovery factor",
      value: formatFactor(summary?.recoveryFactor),
      caption: `${formatMoney(summary?.maxDrawdown || 0, currency)} max drawdown`,
      icon: Activity,
    },
  ];

  const secondaryMetrics = [
    {
      label: "Total trades",
      value: formatNumber(summary?.trades || 0, 0),
      caption: `${summary?.openTrades || 0} open right now`,
      icon: BarChart3,
    },
    {
      label: "Average RR",
      value: formatNumber(summary?.avgRr || 0, 2),
      caption: "Closed and breakeven trades",
      icon: TrendingUp,
    },
    {
      label: "Average risk",
      value: `${formatNumber(summary?.avgRisk || 0, 1)}%`,
      caption: "Across logged trades",
      icon: TrendingDown,
    },
    {
      label: "Best session",
      value: summary?.bestSession?.session || "None yet",
      caption: summary?.bestSession
        ? `${formatMoney(summary.bestSession.pnl, currency)} · ${summary.bestSession.winRate}% win`
        : "Add session tags to trades",
      tone: summary?.bestSession ? pnlClass(summary.bestSession.pnl) : undefined,
      icon: Activity,
    },
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Analytics"
          title="All-Time Performance"
          description="Review every account together, or filter down to one account when you need a cleaner read."
          actions={
            <label className="block min-w-[220px]">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Account filter
              </span>
              <select
                className={`${controlClassName} h-11 text-sm`}
                value={accountFilter}
                onChange={(event) => setAccountFilter(event.target.value)}
                aria-label="Filter analytics by account"
              >
                <option value={ALL_ACCOUNTS}>All accounts</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountName} · {account.accountCurrency || account.currency}
                  </option>
                ))}
              </select>
            </label>
          }
        />

        {normalizedCurrency ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-300/20 dark:bg-amber-300/10 dark:text-amber-200">
            All-account money totals are shown in {data?.reportingCurrency || currency}.
            Closed trades use historical FX where a rate is available.
            {missingFx
              ? ` ${data?.conversionUnavailableCount || 0} trade${data?.conversionUnavailableCount === 1 ? "" : "s"} could not be converted yet.`
              : ""}
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {secondaryMetrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {filteredLabel} - all-time performance
            </p>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {formatNumber(summary?.journals || 0, 0)} journaled days
            </p>
          </div>
          <PerformanceChart curve={data?.equityCurve} currency={currency} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Direction edge
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {(["long", "short"] as const).map((direction) => {
                const item = data?.byDirection[direction];
                return (
                  <div
                    key={direction}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-slate-950 dark:text-white">
                        {directionLabel(direction)}
                      </p>
                      <p className={`font-bold ${pnlClass(item?.pnl || 0)}`}>
                        {formatMoney(item?.pnl || 0, currency)}
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Trades
                        </p>
                        <p className="font-bold text-slate-950 dark:text-white">
                          {formatNumber(item?.trades || 0, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Win %
                        </p>
                        <p className="font-bold text-slate-950 dark:text-white">
                          {formatNumber(item?.winRate || 0, 1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Closed
                        </p>
                        <p className="font-bold text-slate-950 dark:text-white">
                          {formatNumber(item?.closedTrades || 0, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Sessions
            </h2>
            <div className="mt-4 space-y-3">
              {data?.bySession.length ? (
                data.bySession.map((item) => (
                  <StatRow
                    key={item.session}
                    label={item.session}
                    meta={`${item.trades} trades · ${item.winRate}% win`}
                    value={formatMoney(item.pnl, currency)}
                    tone={pnlClass(item.pnl)}
                  />
                ))
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title={isLoading ? "Loading" : "No session data"}
                  body="Tag sessions on trades to rank your best and weakest windows."
                />
              )}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              By symbol
            </h2>
            <div className="mt-4 space-y-3">
              {data?.bySymbol.length ? (
                data.bySymbol.map((item) => (
                  <StatRow
                    key={item.symbol}
                    label={item.symbol}
                    meta={`${item.trades} trades · ${item.winRate}% win`}
                    value={formatMoney(item.pnl, currency)}
                    tone={pnlClass(item.pnl)}
                  />
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
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              Accounts in this view
            </h2>
            <div className="mt-4 space-y-3">
              {(data?.accounts || []).length ? (
                (accountFilter === ALL_ACCOUNTS
                  ? data?.accounts || []
                  : (data?.accounts || []).filter(
                      (account) => account._id === accountFilter,
                    )
                ).map((account) => (
                  <StatRow
                    key={account._id}
                    label={account.accountName}
                    meta={`${account.broker} · ${account.accountCurrency || account.currency} · ${account.status || "Active"}`}
                    value={`${formatNumber(account.tradesCount || 0, 0)} trades`}
                    tone="text-slate-950 dark:text-white"
                  />
                ))
              ) : (
                <EmptyState
                  icon={BarChart3}
                  title={isLoading ? "Loading" : "No accounts"}
                  body="Create or connect an account to build analytics."
                />
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatRow({
  label,
  meta,
  value,
  tone,
}: {
  label: string;
  meta: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3 dark:bg-white/[0.04]">
      <div className="min-w-0">
        <p className="truncate font-bold text-slate-950 dark:text-white">{label}</p>
        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
          {meta}
        </p>
      </div>
      <p className={`shrink-0 text-right font-bold ${tone}`}>{value}</p>
    </div>
  );
}
