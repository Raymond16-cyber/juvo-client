"use client";

import AccountSummary from "@/components/dashboard/AccountSummary";
import BehavioralInsights from "@/components/dashboard/BehavioralInsights";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentTrades from "@/components/dashboard/RecentTrades";
import TradingGoals from "@/components/dashboard/TradingGoals";
import { Activity, Percent, TrendingDown, TrendingUp } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef } from "react";

const metrics = [
  {
    label: "Net P&L",
    value: "+$8,420",
    change: "+12.4% this month",
    tone: "profit" as const,
    icon: TrendingUp,
  },
  {
    label: "Win Rate",
    value: "68%",
    change: "+5.2% vs last month",
    tone: "profit" as const,
    icon: Percent,
  },
  {
    label: "Avg. Drawdown",
    value: "3.1%",
    change: "-0.8% improvement",
    tone: "profit" as const,
    icon: TrendingDown,
  },
  {
    label: "Trades Logged",
    value: "126",
    change: "24 trades this week",
    tone: "neutral" as const,
    icon: Activity,
  },
];

export default function DashboardOverview() {
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".dashboard-card",
        { autoAlpha: 0, y: 22, scale: 0.98 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.65,
          ease: "power3.out",
          stagger: 0.07,
        },
      );
      gsap.to(".dashboard-ticker-track", {
        xPercent: -50,
        duration: 22,
        ease: "none",
        repeat: -1,
      });
      gsap.fromTo(
        ".pulse-profit",
        { boxShadow: "0 0 0 rgba(0,212,255,0)" },
        {
          boxShadow: "0 0 34px rgba(0,212,255,0.22)",
          duration: 1.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        },
      );
    }, dashboardRef);

    return () => context.revert();
  }, []);

  return (
    <div ref={dashboardRef}>
      <DashboardHeader />

      <div className="mb-6 lg:hidden">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Welcome back, Ballistic Trader
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
          Trading Dashboard
        </h1>
      </div>

      <div className="dashboard-card mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white py-2 shadow-sm dark:border-white/10 dark:bg-card">
        <div className="dashboard-ticker-track flex w-max gap-8 px-5 text-xs font-bold text-slate-500 dark:text-slate-400">
          {[
            "XAU/USD 2368.42 +1.8%",
            "NAS100 18422 +0.7%",
            "EUR/USD 1.0842 -0.2%",
            "BTC/USD 67240 +3.4%",
            "US30 39180 +0.5%",
            "GBP/JPY 191.22 +0.9%",
            "XAU/USD 2368.42 +1.8%",
            "NAS100 18422 +0.7%",
            "EUR/USD 1.0842 -0.2%",
            "BTC/USD 67240 +3.4%",
            "US30 39180 +0.5%",
            "GBP/JPY 191.22 +0.9%",
          ].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-4">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.8fr)]">
            <PerformanceChart />
            <RecentTrades />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TradingGoals />
            <BehavioralInsights />
          </div>
        </div>

        <div className="space-y-6">
          <AccountSummary />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
