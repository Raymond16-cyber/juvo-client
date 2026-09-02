"use client";

import { animateDashboardEntrance } from "@/animations/dashboard";
import AccountSummary from "@/components/dashboard/AccountSummary";
import BehavioralInsights from "@/components/dashboard/BehavioralInsights";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import MyDayWorkflowModal from "@/components/dashboard/MyDayWorkflowModal";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTrades from "@/components/dashboard/RecentTrades";
import TradingGoals from "@/components/dashboard/TradingGoals";
import { useAccountsStore } from "@/stores/accounts.store";
import { useAnalyticsStore } from "@/stores/analytics.store";
import { useAuthStore } from "@/stores/auth.store";
import { useGoalsStore } from "@/stores/goals.store";
import { useJournalStore } from "@/stores/journal.store";
import { formatMoney, formatNumber } from "@/lib/format";
import { Activity, Percent, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type WorkflowPanel = "start" | "trade" | "account";

export default function DashboardOverview() {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isMyDayOpen, setIsMyDayOpen] = useState(false);
  const [workflowPanel, setWorkflowPanel] = useState<WorkflowPanel>("start");

  const user = useAuthStore((state) => state.user);
  const journals = useJournalStore((state) => state.journals);
  const getUserJournals = useJournalStore((state) => state.getUserJournals);
  const analytics = useAnalyticsStore((state) => state.data);
  const fetchAnalytics = useAnalyticsStore((state) => state.fetchAnalytics);
  const accounts = useAccountsStore((state) => state.accounts);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const goals = useGoalsStore((state) => state.goals);
  const fetchGoals = useGoalsStore((state) => state.fetchGoals);

  const openMyDayWorkflow = (hasJournalToday?: boolean) => {
    setWorkflowPanel(hasJournalToday ? "trade" : "start");
    setIsMyDayOpen(true);
  };

  const refreshWorkspace = () => {
    getUserJournals().catch(() => undefined);
    fetchAnalytics().catch(() => undefined);
    fetchAccounts().catch(() => undefined);
    fetchGoals().catch(() => undefined);
  };

  useEffect(() => {
    refreshWorkspace();
  }, []);

  useEffect(() => {
    return animateDashboardEntrance(dashboardRef.current);
  }, []);

  const summary = analytics?.summary;
  const metrics = [
    {
      label: "Net P&L",
      value: formatMoney(summary?.netPnl || 0),
      change: summary?.journals
        ? `${summary.journals} journaled days`
        : "No journals yet",
      tone: (summary?.netPnl || 0) >= 0 ? ("profit" as const) : ("loss" as const),
      icon: TrendingUp,
    },
    {
      label: "Win Rate",
      value: `${formatNumber(summary?.winRate || 0, 1)}%`,
      change: `${summary?.wins || 0} wins / ${summary?.losses || 0} losses`,
      tone: (summary?.winRate || 0) >= 50 ? ("profit" as const) : ("neutral" as const),
      icon: Percent,
    },
    {
      label: "Discipline",
      value: `${formatNumber(summary?.avgDiscipline || 0, 0)}%`,
      change: summary?.revengeDays
        ? `${summary.revengeDays} revenge-trade flags`
        : "No revenge-trade flags",
      tone: (summary?.avgDiscipline || 0) >= 70 ? ("profit" as const) : ("neutral" as const),
      icon: TrendingDown,
    },
    {
      label: "Trades Logged",
      value: String(summary?.trades || 0),
      change: `${summary?.openTrades || 0} still open`,
      tone: "neutral" as const,
      icon: Activity,
    },
  ];

  return (
    <div ref={dashboardRef} data-dashboard-main>
      <DashboardHeader onOpenMyDay={openMyDayWorkflow} />

      <div className="mb-5 lg:hidden">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Welcome back, {user?.fullName || "Trader"}!
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
          Trading Dashboard
        </h1>
      </div>

      <div
        data-dashboard-card
        className="dashboard-card mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-sm dark:border-white/10 dark:bg-card lg:mb-6"
      >
        <div
          data-dashboard-ticker
          className="dashboard-ticker-track flex w-max gap-8 px-5 text-xs font-bold text-slate-500 dark:text-slate-400"
        >
          {[
            "Journal before you trade",
            "Risk first. Size second.",
            "One A+ setup beats five impulses",
            "Review the day, not the tick",
            "Discipline compounds",
            "Juvo is your process coach",
            "Journal before you trade",
            "Risk first. Size second.",
            "One A+ setup beats five impulses",
            "Review the day, not the tick",
            "Discipline compounds",
            "Juvo is your process coach",
          ].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] xl:gap-6">
        <div className="order-2 space-y-5 xl:order-1 xl:space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.8fr)]">
            <PerformanceChart curve={analytics?.equityCurve} />
            <RecentTrades journals={journals} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <TradingGoals goals={goals} />
            <BehavioralInsights insights={analytics?.insights} />
          </div>
        </div>

        <div className="order-1 space-y-5 xl:order-2 xl:space-y-6">
          <AccountSummary account={accounts[0]} />
          <QuickActions onOpenMyDay={openMyDayWorkflow} />
        </div>
      </div>

      <MyDayWorkflowModal
        isOpen={isMyDayOpen}
        initialPanel={workflowPanel}
        onClose={() => setIsMyDayOpen(false)}
        onJournalUpdated={refreshWorkspace}
      />
    </div>
  );
}
