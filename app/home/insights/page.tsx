"use client";

import BehavioralInsights from "@/components/dashboard/BehavioralInsights";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PendingBehaviourFlags from "@/components/journal/PendingBehaviourFlags";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { getSelectedAccount } from "@/lib/account";
import { formatMoney, titleCase } from "@/lib/format";
import { getBehaviourOverviewService } from "@/services/behaviour.service";
import { useAccountsStore } from "@/stores/accounts.store";
import { useAnalyticsStore } from "@/stores/analytics.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  BehaviourFlag,
  BehaviourOverview,
} from "@/types/behaviour.types";
import Link from "next/link";
import { useEffect, useState } from "react";

const challengeLabels: Record<string, string> = {
  fomo: "FOMO",
  revenge_trading: "Revenge trading",
  overtrading: "Overtrading",
  impatience: "Impatience",
  poor_risk_management: "Risk management",
  emotional_trading: "Emotional trading",
  lack_of_discipline: "Trading discipline",
  inconsistent_strategy: "Strategy consistency",
  overconfidence: "Euphoria / overconfidence",
};

export default function InsightsPage() {
  const user = useAuthStore((state) => state.user);
  const data = useAnalyticsStore((state) => state.data);
  const fetchAnalytics = useAnalyticsStore((state) => state.fetchAnalytics);
  const accounts = useAccountsStore((state) => state.accounts);
  const selectedAccountId = useAccountsStore((state) => state.selectedAccountId);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const selectedAccount = getSelectedAccount(accounts, selectedAccountId);

  const [overview, setOverview] = useState<BehaviourOverview | null>(null);
  const [pendingFlags, setPendingFlags] = useState<BehaviourFlag[]>([]);
  const [behaviourError, setBehaviourError] = useState<string | null>(null);
  const [behaviourLoading, setBehaviourLoading] = useState(true);

  const loadBehaviour = () => {
    setBehaviourError(null);
    setBehaviourLoading(true);
    getBehaviourOverviewService()
      .then((response) => {
        setOverview(response.data);
        setPendingFlags(response.data.pendingFlags || []);
      })
      .catch(() => {
        setBehaviourError("Behavioural observations could not be loaded.");
      })
      .finally(() => setBehaviourLoading(false));
  };

  useEffect(() => {
    fetchAccounts().catch(() => undefined);
  }, [fetchAccounts]);

  useEffect(() => {
    if (!selectedAccount?._id) return;
    fetchAnalytics(selectedAccount._id).catch(() => undefined);
  }, [fetchAnalytics, selectedAccount?._id]);

  useEffect(() => {
    let active = true;
    getBehaviourOverviewService()
      .then((response) => {
        if (!active) return;
        setOverview(response.data);
        setPendingFlags(response.data.pendingFlags || []);
      })
      .catch(() => {
        if (active) {
          setBehaviourError("Behavioural observations could not be loaded.");
        }
      })
      .finally(() => {
        if (active) setBehaviourLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const challenges =
    overview?.challenges || user?.profile?.biggestChallenges || [];
  const reports = overview?.reports;
  const objectives = overview?.goals || [];

  return (
    <DashboardShell>
      <div className="w-full space-y-5 sm:space-y-6">
        <PageHeader
          eyebrow="Behavioural Insights"
          title="Trading Behavior Review"
          description="Review recorded evidence against the challenges you selected. Suggestions are not diagnoses, and fewer reports do not by themselves prove improvement."
        />

        <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
          {[
            ["Journal discipline average", `${Math.round(data?.summary.avgDiscipline || 0)}%`],
            ["Self-reported revenge days", String(data?.summary.revengeDays || 0)],
            ["Self-reported overtrade days", String(data?.summary.overtradeDays || 0)],
          ].map(([label, value]) => (
            <Card key={label} className="min-h-[6.5rem] min-w-0 p-4 sm:p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
              <p className="mt-2 break-words text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white">
                {value}
              </p>
            </Card>
          ))}
        </div>

        {behaviourError ? (
          <Card className="border-rose-300 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/10 dark:text-rose-200">
            {behaviourError}
            <button
              type="button"
              onClick={loadBehaviour}
              className="ml-2 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </Card>
        ) : null}

        {pendingFlags.length ? (
          <PendingBehaviourFlags
            flags={pendingFlags}
            onResolved={loadBehaviour}
            title="Pending coaching flags"
          />
        ) : null}

        <BehavioralInsights
          insights={data?.insights}
        />

        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Behavioural observations
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Confirmed and suggested observations from the last 30 days,
                compared with the previous 30 days.
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {reports?.dataAvailability.trades ?? 0} trades ·{" "}
              {reports?.dataAvailability.journals ?? 0} journals in period
            </span>
          </div>

          {reports?.dataAvailability.message ? (
            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
              {reports.dataAvailability.message}
            </p>
          ) : !reports?.dataAvailability.sufficientForComparison ? (
            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
              There is some activity, but the history is limited; comparisons
              may not be representative.
            </p>
          ) : null}

          {reports ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/[0.06]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-semibold text-slate-950 dark:text-white">
                  Documented process adherence
                </h3>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  {reports.documentedAdherence.currentPeriod} sessions this
                  period · {reports.documentedAdherence.comparisonPeriod} in
                  the previous period
                </p>
              </div>
              <p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
                {reports.documentedAdherence.interpretation}
              </p>
            </div>
          ) : null}

          {reports?.observations.length ? (
            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
              {reports.observations.map((report) => (
                <article
                  key={report.challenge}
                  className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-950 dark:text-white">
                        {challengeLabels[report.challenge] ||
                          titleCase(report.challenge)}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {report.occurrences} confirmed ·{" "}
                        {report.suggestedOccurrences} awaiting review ·{" "}
                        {report.comparisonOccurrences} in previous period
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-white/10 dark:text-slate-300">
                      {report.trend === "more_recorded"
                        ? "More recorded"
                        : report.trend === "fewer_recorded"
                          ? "Fewer recorded"
                          : "No change"}
                    </span>
                  </div>

                  {report.confidence !== null ? (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                      Mean signal confidence: {Math.round(report.confidence * 100)}%
                    </p>
                  ) : null}
                  {report.recommendation ? (
                    <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {report.recommendation}
                    </p>
                  ) : null}

                  {report.evidence.length ? (
                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 dark:border-white/10">
                      {report.evidence.slice(0, 3).map((evidence, index) => (
                        <div
                          key={`${evidence.date}-${index}`}
                          className="text-sm"
                        >
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            <span>
                              {evidence.source === "user_reported"
                                ? "Journal reflection"
                                : evidence.source === "confirmed_inference"
                                  ? "Confirmed signal"
                                  : "Suggested signal"}
                            </span>
                            {evidence.date ? (
                              <time dateTime={evidence.date}>
                                {new Date(evidence.date).toLocaleDateString()}
                              </time>
                            ) : null}
                            {evidence.symbol ? <span>{evidence.symbol}</span> : null}
                          </div>
                          <p className="mt-1 leading-5 text-slate-700 dark:text-slate-300">
                            {evidence.description}
                          </p>
                          {evidence.associatedOutcome ? (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Associated trade result:{" "}
                              {formatMoney(
                                evidence.associatedOutcome.amount,
                                evidence.associatedOutcome.currency,
                              )}
                              . This is not attributed to the behaviour.
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                      No observations recorded in this period.
                    </p>
                  )}
                  <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {report.interpretation}
                  </p>
                </article>
              ))}
            </div>
          ) : behaviourLoading ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Loading behavioural observations…
            </p>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
              {challenges.length ? (
                "No behaviour challenges are selected. Update your preferences to focus this review."
              ) : (
                <>
                  Select the behaviours you want JUVO to monitor in{" "}
                  <Link
                    href="/home/general/settings"
                    className="font-semibold text-primary underline underline-offset-2"
                  >
                    Settings
                  </Link>
                  .
                </>
              )}
            </div>
          )}
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Behaviour improvement objectives
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Progress counts observations you review and confirm or dismiss;
                it is not a score of discipline or proof of improvement.
              </p>
            </div>
            <Link
              href="/home/growth"
              className="text-sm font-semibold text-primary underline underline-offset-2"
            >
              Manage goals
            </Link>
          </div>

          {objectives.length ? (
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {objectives.map((goal) => {
                const target = Math.max(1, goal.targetValue);
                const progress = Math.min(
                  100,
                  Math.round((goal.currentValue / target) * 100),
                );
                return (
                  <div
                    key={goal._id}
                    className="rounded-xl border border-slate-200 p-4 dark:border-white/10"
                  >
                    <p className="font-semibold text-slate-950 dark:text-white">
                      {goal.title}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                      {goal.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>
                        {goal.currentValue} / {goal.targetValue} reviewed
                      </span>
                      <span>{goal.status}</span>
                    </div>
                    <div
                      className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${goal.title} reviewed observations`}
                    >
                      <div
                        className="h-full rounded-full bg-primary transition-[width]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {challenges.length
                ? "Your challenge-linked objectives are being prepared."
                : "Select a challenge in Settings to create a linked objective."}
            </p>
          )}
        </Card>

        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Selected challenges
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            These are the behaviours you selected during onboarding or in
            Settings. Monitoring is limited to the evidence available in your
            journals and trades.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {challenges.length ? (
              challenges.map((challenge) => (
                <span
                  key={challenge}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200"
                >
                  {challengeLabels[challenge] || titleCase(challenge)}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No behavioural challenges selected yet.
              </p>
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
