"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import VoiceNoteTextarea from "@/components/journal/VoiceNoteTextarea";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { controlClassName, textareaClassName } from "@/lib/ui";
import { getSelectedAccount, getTradableAccounts } from "@/lib/account";
import { getApiErrorMessage } from "@/lib/axios";
import {
  getAiAccessService,
  goalCoachService,
  hasAiFeature,
} from "@/services/ai.service";
import { useAccountsStore } from "@/stores/accounts.store";
import { useGoalsStore } from "@/stores/goals.store";
import { AiAccess } from "@/types/ai.types";
import { CreateGoalPayload } from "@/types/goal.types";
import { Sparkles, Target } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const defaultGoal: CreateGoalPayload = {
  tradingAccount: "",
  title: "",
  description: "",
  category: "Discipline",
  targetType: "Percentage",
  targetValue: 100,
  currentValue: 0,
  unit: "%",
  priority: "Medium",
};

export default function GrowthPage() {
  const goals = useGoalsStore((state) => state.goals);
  const isLoading = useGoalsStore((state) => state.isLoading);
  const fetchGoals = useGoalsStore((state) => state.fetchGoals);
  const createGoal = useGoalsStore((state) => state.createGoal);
  const updateGoal = useGoalsStore((state) => state.updateGoal);
  const deleteGoal = useGoalsStore((state) => state.deleteGoal);
  const accounts = useAccountsStore((state) => state.accounts);
  const selectedAccountId = useAccountsStore((state) => state.selectedAccountId);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const [form, setForm] = useState(defaultGoal);
  const [error, setError] = useState<string | null>(null);
  const [aiAccess, setAiAccess] = useState<AiAccess | null>(null);
  const [coachByGoal, setCoachByGoal] = useState<Record<string, string>>({});
  const [coachLoadingId, setCoachLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals().catch(() => undefined);
    fetchAccounts().catch(() => undefined);
    getAiAccessService()
      .then((response) => setAiAccess(response.data))
      .catch(() => undefined);
  }, [fetchAccounts, fetchGoals]);

  const canUseGoalCoach = hasAiFeature(aiAccess, "goal_coach");

  const runGoalCoach = async (goalId: string) => {
    if (!canUseGoalCoach) {
      setCoachByGoal((current) => ({
        ...current,
        [goalId]: "Goal Coach is included on Super. Upgrade to unlock.",
      }));
      return;
    }
    setCoachLoadingId(goalId);
    try {
      const response = await goalCoachService({ goalId, action: "plan" });
      const steps = response.data.steps?.length
        ? `\n${response.data.steps.map((step) => `• ${step}`).join("\n")}`
        : "";
      setCoachByGoal((current) => ({
        ...current,
        [goalId]: `${response.data.summary}${steps}`,
      }));
    } catch (coachError) {
      setCoachByGoal((current) => ({
        ...current,
        [goalId]: getApiErrorMessage(
          coachError,
          "Juvo could not coach this goal right now.",
        ),
      }));
    } finally {
      setCoachLoadingId(null);
    }
  };

  useEffect(() => {
    const preferred =
      getSelectedAccount(accounts, selectedAccountId) ||
      getTradableAccounts(accounts)[0];
    if (preferred?._id) {
      queueMicrotask(() => {
        setForm((current) => ({
          ...current,
          tradingAccount: current.tradingAccount || preferred._id,
        }));
      });
    }
  }, [accounts, selectedAccountId]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await createGoal(form);
      setForm({ ...defaultGoal, tradingAccount: accounts[0]?._id || "" });
    } catch {
      setError("Unable to create goal. Add a trading account first.");
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Growth"
          title="Process goals"
          description="Track discipline, journaling, and risk — not a monthly profit fantasy."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card className="divide-y divide-slate-200 dark:divide-white/10">
            {goals.length ? (
              goals.map((goal) => {
                const progress = goal.targetValue
                  ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
                  : 0;
                return (
                  <article key={goal._id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-bold text-slate-950 dark:text-white">
                          {goal.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {goal.category} · {goal.priority} · {goal.status}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="ghost"
                          className="h-9 px-3"
                          onClick={() =>
                            updateGoal(goal._id, {
                              currentValue: Math.min(
                                goal.targetValue,
                                goal.currentValue + goal.targetValue / 10,
                              ),
                              status:
                                goal.currentValue + goal.targetValue / 10 >= goal.targetValue
                                  ? "Completed"
                                  : goal.status,
                            })
                          }
                        >
                          Log progress
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 px-3"
                          onClick={() => void runGoalCoach(goal._id)}
                          disabled={coachLoadingId === goal._id}
                        >
                          <Sparkles size={14} />
                          {coachLoadingId === goal._id
                            ? "Coaching…"
                            : canUseGoalCoach
                              ? "Goal coach"
                              : "Unlock coach"}
                        </Button>
                        <Button
                          variant="ghost"
                          className="h-9 px-3"
                          onClick={() => deleteGoal(goal._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    {coachByGoal[goal._id] ? (
                      <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm whitespace-pre-wrap text-slate-700 dark:border-primary/30 dark:bg-primary/10 dark:text-slate-200">
                        {coachByGoal[goal._id]}
                        {!canUseGoalCoach ? (
                          <div className="mt-2">
                            <Link
                              href="/home/general/subscriptions"
                              className="font-semibold text-primary"
                            >
                              Upgrade to Super
                            </Link>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                );
              })
            ) : (
              <EmptyState
                icon={Target}
                title={isLoading ? "Loading goals" : "No goals yet"}
                body="Create a process goal such as journaling 20 days or keeping risk at 1%."
              />
            )}
          </Card>

          <form onSubmit={handleCreate}>
            <Card className="space-y-4 p-5">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">New goal</h2>
              {error ? (
                <p className="rounded-2xl bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
                  {error}
                </p>
              ) : null}
              <select
                className={controlClassName}
                value={form.tradingAccount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tradingAccount: event.target.value }))
                }
                required
              >
                <option value="">Trading account</option>
                {accounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.accountName}
                  </option>
                ))}
              </select>
              <input
                className={controlClassName}
                placeholder="Title"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                required
              />
              <VoiceNoteTextarea
                label="Why this matters"
                value={form.description || ""}
                onChange={(next) =>
                  setForm((current) => ({ ...current, description: next }))
                }
                placeholder="Why this matters"
                helperText="Dictate the reason behind the goal."
                textareaClassNameOverride={textareaClassName}
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={controlClassName}
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category: event.target.value as CreateGoalPayload["category"],
                    }))
                  }
                >
                  {["Discipline", "Risk Management", "Journaling", "Psychology", "Consistency", "Performance", "Custom"].map(
                    (item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ),
                  )}
                </select>
                <input
                  className={controlClassName}
                  type="number"
                  min="0"
                  placeholder="Target"
                  value={form.targetValue}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      targetValue: Number(event.target.value),
                    }))
                  }
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                Create goal
              </Button>
            </Card>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
