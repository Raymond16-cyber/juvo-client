"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { controlClassName, textareaClassName } from "@/lib/ui";
import { getSelectedAccount, getTradableAccounts } from "@/lib/account";
import { useAccountsStore } from "@/stores/accounts.store";
import { useGoalsStore } from "@/stores/goals.store";
import { CreateGoalPayload } from "@/types/goal.types";
import { Target } from "lucide-react";
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

  useEffect(() => {
    fetchGoals().catch(() => undefined);
    fetchAccounts().catch(() => undefined);
  }, [fetchAccounts, fetchGoals]);

  useEffect(() => {
    const preferred =
      getSelectedAccount(accounts, selectedAccountId) ||
      getTradableAccounts(accounts)[0];
    if (preferred?._id) {
      setForm((current) => ({
        ...current,
        tradingAccount: current.tradingAccount || preferred._id,
      }));
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
                      <div className="flex gap-2">
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
              <textarea
                className={textareaClassName}
                placeholder="Why this matters"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
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
