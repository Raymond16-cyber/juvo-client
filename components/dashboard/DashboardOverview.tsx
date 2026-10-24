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

import {
  filterByAccount,
  getSelectedAccount,
  isAccountInPlay,
} from "@/lib/account";
import { formatMoney, formatNumber } from "@/lib/format";

import { useAccountsStore } from "@/stores/accounts.store";
import { useAnalyticsStore } from "@/stores/analytics.store";
import { useAuthStore } from "@/stores/auth.store";
import { useBrokerStore } from "@/stores/broker.store";
import { useGoalsStore } from "@/stores/goals.store";
import { useJournalStore } from "@/stores/journal.store";

import { Activity, Percent, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { hints as createHints } from "driver.js/hints";
import "driver.js/dist/hints.css";

import { checklist } from "driver.js/checklist";
import "driver.js/dist/checklist.css";

type WorkflowPanel = "start" | "trade" | "account";

export default function DashboardOverview() {
  const dashboardRef = useRef<HTMLDivElement>(null);

  const [isMyDayOpen, setIsMyDayOpen] = useState(false);
  const [workflowPanel, setWorkflowPanel] = useState<WorkflowPanel>("start");

  // --------------------------------------------------
  // STORES
  // --------------------------------------------------

  const user = useAuthStore((state) => state.user);

  const journals = useJournalStore((state) => state.journals);
  const getUserJournals = useJournalStore((state) => state.getUserJournals);

  const analytics = useAnalyticsStore((state) => state.data);
  const fetchAnalytics = useAnalyticsStore((state) => state.fetchAnalytics);

  const accounts = useAccountsStore((state) => state.accounts);
  const selectedAccountId = useAccountsStore(
    (state) => state.selectedAccountId,
  );
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);

  const goals = useGoalsStore((state) => state.goals);
  const fetchGoals = useGoalsStore((state) => state.fetchGoals);

  const brokerPositions = useBrokerStore((state) => state.positions);
  const fetchBrokerPositions = useBrokerStore((state) => state.fetchPositions);

  // --------------------------------------------------
  // SELECTED ACCOUNT
  // --------------------------------------------------

  const selectedAccount = getSelectedAccount(accounts, selectedAccountId);

  const accountJournals = useMemo(
    () => filterByAccount(journals, selectedAccount?._id),
    [journals, selectedAccount?._id],
  );

  const accountGoals = useMemo(
    () => filterByAccount(goals, selectedAccount?._id),
    [goals, selectedAccount?._id],
  );

  const accountBrokerPositions = useMemo(
    () =>
      brokerPositions.filter((position) => {
        if (!selectedAccount?._id) return true;

        const tradingAccount = position.tradingAccount;

        if (!tradingAccount) return false;

        if (typeof tradingAccount === "string") {
          return tradingAccount === selectedAccount._id;
        }

        return tradingAccount._id === selectedAccount._id;
      }),
    [brokerPositions, selectedAccount],
  );

  const liveBrokerPnl = useMemo(
    () =>
      accountBrokerPositions.reduce((total, position) => {
        const pnl =
          position.live?.netUnrealizedPnl ??
          position.live?.grossUnrealizedPnl ??
          position.live?.floatingProfitIndicative ??
          0;

        return total + Number(pnl || 0);
      }, 0),
    [accountBrokerPositions],
  );

  const dashboardAccount = useMemo(() => {
    if (!selectedAccount) return null;

    const balance = Number(selectedAccount.currentBalance || 0);

    return {
      ...selectedAccount,
      currentEquity: Number((balance + liveBrokerPnl).toFixed(2)),
    };
  }, [liveBrokerPnl, selectedAccount]);

  const currency =
    dashboardAccount?.accountCurrency ||
    dashboardAccount?.currency ||
    analytics?.currency ||
    "USD";

  // --------------------------------------------------
  // MY DAY WORKFLOW
  // --------------------------------------------------

  const openMyDayWorkflow = (hasJournalToday?: boolean) => {
    if (hasJournalToday) {
      setWorkflowPanel("trade");
    } else if (!selectedAccount || !isAccountInPlay(selectedAccount)) {
      setWorkflowPanel("account");
    } else {
      setWorkflowPanel("start");
    }

    setIsMyDayOpen(true);
  };

  // Keep the latest workflow handler available to the
  // checklist without recreating the Driver.js instances.
  const openMyDayWorkflowRef = useRef(openMyDayWorkflow);
  openMyDayWorkflowRef.current = openMyDayWorkflow;

  // --------------------------------------------------
  // DRIVER.JS: PRODUCT TOUR, HINTS AND CHECKLIST
  // --------------------------------------------------

  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const currentUser = user as {
      _id?: string;
      id?: string;
      email?: string;
    };

    const userKey =
      currentUser._id ?? currentUser.id ?? currentUser.email ?? "current-user";

    const storagePrefix = `juvo:dashboard-guide:v1:${userKey}`;

    const dismissedHintsKey = `${storagePrefix}:dismissed-hints`;

    const completedChecklistKey = `${storagePrefix}:completed-checklist`;

    // Safely read arrays from localStorage.
    const readStringArray = (key: string): string[] => {
      try {
        const saved: unknown = JSON.parse(
          window.localStorage.getItem(key) ?? "[]",
        );

        return Array.isArray(saved)
          ? saved.filter((item): item is string => typeof item === "string")
          : [];
      } catch {
        return [];
      }
    };

    // 1. GUIDED DASHBOARD TOUR
    // ------------------------------------------------

    const tour = driver({
      showProgress: true,
      progressText: "{{current}} of {{total}}",

      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Finish",

      allowClose: true,
      allowScroll: true,
      allowKeyboardControl: true,
      smoothScroll: true,
      skipMissingElement: true,

      overlayOpacity: 0.65,
      stagePadding: 8,
      popoverClass: "juvo-driver-popover",

      steps: [
        {
          element: "[data-tour='dashboard-metrics']",
          popover: {
            title: "Your performance at a glance",
            description:
              "Review your key trading metrics to understand how your account is performing.",
          },
        },
        {
          element: "[data-tour='account-summary']",
          popover: {
            title: "Your trading account",
            description:
              "Review your selected account, balance and available account information.",
          },
        },
        {
          element: "[data-tour='performance-chart']",
          popover: {
            title: "Track your progress",
            description:
              "Observe how your trading performance changes over time. Look for patterns rather than judging yourself by one trade.",
          },
        },
        {
          element: "[data-tour='recent-trades']",
          popover: {
            title: "Your recent trades",
            description:
              "Review your recent trading activity and revisit the decisions behind your results.",
          },
        },
        {
          element: "[data-tour='trading-goals']",
          popover: {
            title: "Stay focused on your goals",
            description:
              "Keep your trading objectives visible as you work towards them.",
          },
        },
        {
          element: "[data-tour='behavioral-insights']",
          popover: {
            title: "Understand your trading behaviour",
            description:
              "Explore behavioural insights that can help you recognise patterns in your trading decisions.",
          },
        },
        {
          element: "[data-tour='quick-actions']",
          popover: {
            title: "Your shortcuts",
            description:
              "Use these shortcuts to access important dashboard actions more quickly.",
          },
        },
      ],
    });

    // 2. INTERACTIVE HINTS
    // ------------------------------------------------

    const dismissedHintIds = new Set(readStringArray(dismissedHintsKey));

    const hintDefinitions = [
      {
        id: "metrics-hint",
        element: "[data-tour='dashboard-metrics']",
        popover: {
          title: "Your trading metrics",
          description:
            "Start here for a quick overview of your trading performance.",
        },
      },
      {
        id: "account-hint",
        element: "[data-tour='account-summary']",
        popover: {
          title: "Account overview",
          description:
            "Check your account information before reviewing your results.",
        },
      },
      {
        id: "chart-hint",
        element: "[data-tour='performance-chart']",
        popover: {
          title: "Performance over time",
          description:
            "Use your performance history to identify trends in your results.",
        },
      },
      {
        id: "insights-hint",
        element: "[data-tour='behavioral-insights']",
        popover: {
          title: "Trade with greater awareness",
          description:
            "Reflect on your habits and decisions to help build a more consistent trading process.",
        },
      },
      {
        id: "quick-actions-hint",
        element: "[data-tour='quick-actions']",
        popover: {
          title: "Your shortcuts",
          description: "Find frequently used dashboard actions here.",
        },
      },
    ];

    const productHints = createHints({
      buttonText: "Got it",
      popoverClass: "juvo-driver-popover",

      hints: hintDefinitions.filter((hint) => !dismissedHintIds.has(hint.id)),

      onDismiss: (_element, hint) => {
        if (!hint.id) return;

        dismissedHintIds.add(hint.id);

        try {
          window.localStorage.setItem(
            dismissedHintsKey,
            JSON.stringify([...dismissedHintIds]),
          );
        } catch {
          // The hints still work if storage is unavailable.
        }
      },
    });

    

    // 3. PERSISTENT ONBOARDING CHECKLIST
    // ------------------------------------------------

    const guide = checklist({
      id: `juvo-dashboard-guide-${userKey}`,

      title: "JUVO Guide",
      description: "Complete these steps to get familiar with your dashboard.",

      launcherText: "JUVO Guide",
      progressText: "{{done}} of {{total}} complete",
      launcherProgressText: "{{done}}/{{total}}",

      completeTitle: "You're all set!",
      completeDescription: "You've completed the main dashboard introduction.",
      completeLauncherText: "Guide complete",

      items: [
        {
          id: "dashboard-tour",
          title: "Explore your dashboard",
          description: "Take a guided tour of the main dashboard sections.",
          tour,
        },
        {
          id: "show-dashboard-tips",
          title: "Show dashboard tips",
          description: "Display helpful hints around your dashboard.",
          action: () => {
            productHints.show();
          },
        },
        {
          id: "open-my-day",
          title: "Open My Day",
          description: "Explore your daily trading workflow.",
          action: () => {
            openMyDayWorkflowRef.current();
          },
        },
      ],

      completed: readStringArray(completedChecklistKey),

      onProgress: ({ completed }) => {
        try {
          window.localStorage.setItem(
            completedChecklistKey,
            JSON.stringify(completed),
          );
        } catch {
          // The checklist remains usable without storage.
        }
      },
    });

    guide.show();

    // 4. AUTO-START AFTER SUCCESSFUL ONBOARDING
    // ------------------------------------------------

    let autoStartFrame: number | undefined;

    try {
      if (window.localStorage.getItem("juvo:start-dashboard-tour") === "1") {
        autoStartFrame = window.requestAnimationFrame(() => {
          // Remove the flag only when the scheduled callback
          // actually runs. This avoids losing it if React
          // cancels the first effect during development checks.
          try {
            window.localStorage.removeItem("juvo:start-dashboard-tour");
          } catch {
            // The tour can still run without storage access.
          }

          tour.drive();
        });
      }
    } catch {
      // The user can still start the tour from JUVO Guide.
    }

    // 5. CLEANUP
    // ------------------------------------------------

    return () => {
      if (autoStartFrame !== undefined) {
        window.cancelAnimationFrame(autoStartFrame);
      }

      productHints.hide();
      guide.hide();
      tour.destroy();
    };
  }, [user]);

  // --------------------------------------------------
  // REFRESH DASHBOARD DATA
  // --------------------------------------------------

  const refreshWorkspace = () => {
    fetchAccounts().catch(() => undefined);
    getUserJournals().catch(() => undefined);
    fetchGoals().catch(() => undefined);
    fetchBrokerPositions("open").catch(() => undefined);

    if (selectedAccount?._id) {
      fetchAnalytics(selectedAccount._id).catch(() => undefined);
    }
  };

  useEffect(() => {
    fetchAccounts().catch(() => undefined);
    getUserJournals().catch(() => undefined);
    fetchGoals().catch(() => undefined);
    fetchBrokerPositions("open").catch(() => undefined);
  }, [fetchAccounts, fetchBrokerPositions, fetchGoals, getUserJournals]);

  useEffect(() => {
    if (!selectedAccount?._id) return;

    fetchAnalytics(selectedAccount._id).catch(() => undefined);
  }, [fetchAnalytics, selectedAccount?._id]);

  useEffect(() => {
    return animateDashboardEntrance(dashboardRef.current);
  }, []);

  // --------------------------------------------------
  // DASHBOARD METRICS
  // --------------------------------------------------

  const summary = analytics?.summary;
  const accountBalance = Number(dashboardAccount?.currentBalance);

  const netPnlValue =
    Number.isFinite(accountBalance) && accountBalance < 0
      ? accountBalance
      : Number(summary?.netPnl || 0);

  const metrics = [
    {
      label: "Net P&L",
      value: formatMoney(netPnlValue, currency),
      change:
        Number.isFinite(accountBalance) && accountBalance < 0
          ? "Account balance below zero"
          : summary?.journals
            ? `${summary.journals} journaled days`
            : "No journals yet",
      tone: netPnlValue >= 0 ? ("profit" as const) : ("loss" as const),
      icon: TrendingUp,
    },
    {
      label: "Win Rate",
      value: `${formatNumber(summary?.winRate || 0, 1)}%`,
      change: `${summary?.wins || 0} wins / ${summary?.losses || 0} losses`,
      tone:
        (summary?.winRate || 0) >= 50
          ? ("profit" as const)
          : ("neutral" as const),
      icon: Percent,
    },
    {
      label: "Discipline",
      value: `${formatNumber(summary?.avgDiscipline || 0, 0)}%`,
      change: summary?.revengeDays
        ? `${summary.revengeDays} revenge-trade flags`
        : "No revenge-trade flags",
      tone:
        (summary?.avgDiscipline || 0) >= 70
          ? ("profit" as const)
          : ("neutral" as const),
      icon: TrendingDown,
    },
    {
      label: "Trades Logged",
      value: String(summary?.trades || 0),
      change: `${accountBrokerPositions.length} live cTrader positions`,
      tone: "neutral" as const,
      icon: Activity,
    },
  ];

  // --------------------------------------------------
  // DASHBOARD UI
  // --------------------------------------------------

  return (
    <div ref={dashboardRef} data-dashboard-main>
      <DashboardHeader onOpenMyDay={openMyDayWorkflow} />

      {/* Mobile dashboard heading */}
      <div className="mb-5 lg:hidden">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Welcome back, {user?.fullName || "Trader"}!
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
          Trading Dashboard
        </h1>
      </div>

      {/* Trading discipline ticker */}
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

      {/* Main dashboard layout */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] xl:gap-6">
        {/* Main content */}
        <div className="order-2 space-y-5 xl:order-1 xl:space-y-6">
          {/* Metrics */}
          <div
            data-tour="dashboard-metrics"
            className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4"
          >
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </div>

          {/* Performance chart and recent trades */}
          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.8fr)]">
            <div data-tour="performance-chart" className="min-w-0">
              <PerformanceChart
                curve={analytics?.equityCurve}
                currency={currency}
              />
            </div>

            <div data-tour="recent-trades" className="min-w-0">
              <RecentTrades
                journals={accountJournals}
                currency={currency}
                brokerPositions={accountBrokerPositions}
              />
            </div>
          </div>

          {/* Goals and behavioural insights */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div data-tour="trading-goals" className="min-w-0">
              <TradingGoals goals={accountGoals} />
            </div>

            <div data-tour="behavioral-insights" className="min-w-0">
              <BehavioralInsights insights={analytics?.insights} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="order-1 space-y-5 xl:order-2 xl:space-y-6">
          <div data-tour="account-summary">
            <AccountSummary
              account={dashboardAccount}
              livePnl={liveBrokerPnl}
            />
          </div>

          <div data-tour="quick-actions">
            <QuickActions onOpenMyDay={openMyDayWorkflow} />
          </div>
        </div>
      </div>

      {/* My Day workflow modal */}
      <MyDayWorkflowModal
        isOpen={isMyDayOpen}
        initialPanel={workflowPanel}
        onClose={() => setIsMyDayOpen(false)}
        onJournalUpdated={refreshWorkspace}
      />
    </div>
  );
}
