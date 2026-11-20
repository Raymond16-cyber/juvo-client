"use client";

import BehavioralInsights from "@/components/dashboard/BehavioralInsights";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PendingBehaviourFlags from "@/components/journal/PendingBehaviourFlags";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { CHALLENGE_TIPS } from "@/constants/onboarding";
import { getSelectedAccount } from "@/lib/account";
import { titleCase } from "@/lib/format";
import { getBehaviourOverviewService } from "@/services/behaviour.service";
import { useAccountsStore } from "@/stores/accounts.store";
import { useAnalyticsStore } from "@/stores/analytics.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  BehaviourFlag,
  ChallengeProgressEntry,
} from "@/types/behaviour.types";
import { useEffect, useMemo, useState } from "react";

const statusStyles: Record<string, string> = {
  active: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-200",
  improving:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-200",
  overcome:
    "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-200",
  paused: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
};

export default function InsightsPage() {
  const user = useAuthStore((state) => state.user);
  const data = useAnalyticsStore((state) => state.data);
  const fetchAnalytics = useAnalyticsStore((state) => state.fetchAnalytics);
  const accounts = useAccountsStore((state) => state.accounts);
  const selectedAccountId = useAccountsStore((state) => state.selectedAccountId);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const selectedAccount = getSelectedAccount(accounts, selectedAccountId);

  const [progress, setProgress] = useState<ChallengeProgressEntry[]>([]);
  const [pendingFlags, setPendingFlags] = useState<BehaviourFlag[]>([]);

  const loadBehaviour = () => {
    getBehaviourOverviewService()
      .then((response) => {
        setProgress(response.data.progress || []);
        setPendingFlags(response.data.pendingFlags || []);
      })
      .catch(() => undefined);
  };

  useEffect(() => {
    fetchAccounts().catch(() => undefined);
  }, [fetchAccounts]);

  useEffect(() => {
    if (!selectedAccount?._id) return;
    fetchAnalytics(selectedAccount._id).catch(() => undefined);
  }, [fetchAnalytics, selectedAccount?._id]);

  useEffect(() => {
    loadBehaviour();
  }, []);

  const challenges = user?.profile?.biggestChallenges || [];
  const progressCards = useMemo(() => {
    if (progress.length) {
      return progress.filter((entry) => entry.status !== "paused");
    }
    return challenges.map((challenge) => ({
      challenge,
      status: "active" as const,
      flagCount: 0,
      confirmedCount: 0,
      streakWithoutFlag: 0,
      tip: CHALLENGE_TIPS[challenge] || null,
    }));
  }, [progress, challenges]);

  const challengeNotes = progressCards
    .filter((entry) => entry.status === "active" || entry.status === "improving")
    .slice(0, 3)
    .map((entry) => ({
      title: titleCase(entry.challenge),
      body:
        entry.tip ||
        CHALLENGE_TIPS[entry.challenge] ||
        "Stay aware of this pattern while you journal.",
      score:
        entry.status === "improving"
          ? Math.min(95, 55 + entry.streakWithoutFlag * 8)
          : Math.max(20, 70 - entry.confirmedCount * 10),
      category: "discipline" as const,
    }));

  return (
    <DashboardShell>
      <div className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-6">
        <PageHeader
          eyebrow="Behavioural Insights"
          title="Trading Behavior Review"
          description="Juvo scores the process: plan adherence, revenge trading, overtrading, and session quality."
        />

        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
          {[
            ["Discipline", `${Math.round(data?.summary.avgDiscipline || 0)}%`],
            ["Revenge days", String(data?.summary.revengeDays || 0)],
            ["Overtrade days", String(data?.summary.overtradeDays || 0)],
          ].map(([label, value]) => (
            <Card key={label} className="min-h-[6.5rem] min-w-0 p-4 sm:p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-2 break-words text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white">
                {value}
              </p>
            </Card>
          ))}
        </div>

        {pendingFlags.length ? (
          <PendingBehaviourFlags
            flags={pendingFlags}
            onResolved={loadBehaviour}
            title="Pending coaching flags"
          />
        ) : null}

        <BehavioralInsights
          insights={
            challengeNotes.length ? challengeNotes : data?.insights
          }
        />

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Challenge coaching
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Progress against the leaks you named in onboarding. Auto flags are
            suggestions until you confirm them.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {progressCards.length ? (
              progressCards.map((entry) => (
                <div
                  key={entry.challenge}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-slate-950 dark:text-white">
                      {titleCase(entry.challenge)}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        statusStyles[entry.status] || statusStyles.active
                      }`}
                    >
                      {titleCase(entry.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {entry.tip ||
                      CHALLENGE_TIPS[entry.challenge] ||
                      "Keep reviewing this pattern in your journal."}
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-xl bg-white px-2 py-2 dark:bg-black/20">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Flags
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                        {entry.flagCount || 0}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-2 py-2 dark:bg-black/20">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Confirmed
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                        {entry.confirmedCount || 0}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-2 py-2 dark:bg-black/20">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Clean
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                        {entry.streakWithoutFlag || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 sm:col-span-2">
                Complete onboarding to pin the leaks you already know about.
              </p>
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
