"use client";

import BehavioralInsights from "@/components/dashboard/BehavioralInsights";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { getSelectedAccount } from "@/lib/account";
import { titleCase } from "@/lib/format";
import { useAccountsStore } from "@/stores/accounts.store";
import { useAnalyticsStore } from "@/stores/analytics.store";
import { useAuthStore } from "@/stores/auth.store";
import { useEffect } from "react";

export default function InsightsPage() {
  const user = useAuthStore((state) => state.user);
  const data = useAnalyticsStore((state) => state.data);
  const fetchAnalytics = useAnalyticsStore((state) => state.fetchAnalytics);
  const accounts = useAccountsStore((state) => state.accounts);
  const selectedAccountId = useAccountsStore((state) => state.selectedAccountId);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const selectedAccount = getSelectedAccount(accounts, selectedAccountId);

  useEffect(() => {
    fetchAccounts().catch(() => undefined);
  }, [fetchAccounts]);

  useEffect(() => {
    if (!selectedAccount?._id) return;
    fetchAnalytics(selectedAccount._id).catch(() => undefined);
  }, [fetchAnalytics, selectedAccount?._id]);

  const challenges = user?.profile?.biggestChallenges || [];

  return (
    <DashboardShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <PageHeader
          eyebrow="Behavioural Insights"
          title="Trading Behavior Review"
          description="Juvo scores the process: plan adherence, revenge trading, overtrading, and session quality."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Discipline", `${Math.round(data?.summary.avgDiscipline || 0)}%`],
            ["Revenge days", String(data?.summary.revengeDays || 0)],
            ["Overtrade days", String(data?.summary.overtradeDays || 0)],
          ].map(([label, value]) => (
            <Card key={label} className="p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{value}</p>
            </Card>
          ))}
        </div>

        <BehavioralInsights insights={data?.insights} />

        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Challenges you named in onboarding
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {challenges.length ? (
              challenges.map((challenge) => (
                <span
                  key={challenge}
                  className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300"
                >
                  {titleCase(challenge)}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Complete onboarding to pin the leaks you already know about.
              </p>
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
