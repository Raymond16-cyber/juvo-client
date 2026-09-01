"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { formatMoney, formatNumber } from "@/lib/format";
import { controlClassName } from "@/lib/ui";
import { useAccountsStore } from "@/stores/accounts.store";
import { CreateTradingAccountPayload } from "@/types/trading-account.types";
import { WalletCards } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

const defaultForm: CreateTradingAccountPayload = {
  accountName: "",
  accountNumber: "",
  accountType: "demo",
  broker: "",
  initialBalance: 0,
  platform: "",
  server: "",
  leverage: "1:100",
  currency: "USD",
  maxDrawnDown: 10,
  profitTarget: 10,
};

export default function TradingAccountsPage() {
  const accounts = useAccountsStore((state) => state.accounts);
  const isLoading = useAccountsStore((state) => state.isLoading);
  const error = useAccountsStore((state) => state.error);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const createAccount = useAccountsStore((state) => state.createAccount);
  const deleteAccount = useAccountsStore((state) => state.deleteAccount);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetchAccounts().catch(() => undefined);
  }, [fetchAccounts]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createAccount(form);
    setForm(defaultForm);
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Accounts"
          title="Trading Accounts"
          description="Every journal is tied to an account. Demo, live, prop, or challenge — keep them separate."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-4">
            {accounts.length ? (
              accounts.map((account) => (
                <Card key={account._id} className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold text-slate-950 dark:text-white">
                        {account.accountName}
                      </p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {account.broker} · {account.platform} · {account.accountType}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      className="h-9 px-3"
                      onClick={() => deleteAccount(account._id)}
                    >
                      Archive
                    </Button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["Balance", formatMoney(account.currentBalance, account.currency)],
                      ["Equity", formatMoney(account.currentEquity, account.currency)],
                      ["Leverage", account.leverage],
                      ["Target", `${formatNumber(account.profitTarget)}%`],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/[0.04]"
                      >
                        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                        <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <EmptyState
                  icon={WalletCards}
                  title={isLoading ? "Loading accounts" : "No trading accounts"}
                  body="Create an account before you start today's journal."
                />
              </Card>
            )}
          </div>

          <form onSubmit={handleCreate}>
            <Card className="space-y-3 p-5">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Add account
              </h2>
              {error ? (
                <p className="rounded-2xl bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
                  {error}
                </p>
              ) : null}
              <input
                className={controlClassName}
                placeholder="Account name"
                value={form.accountName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, accountName: event.target.value }))
                }
                required
              />
              <input
                className={controlClassName}
                placeholder="Account number"
                value={form.accountNumber}
                onChange={(event) =>
                  setForm((current) => ({ ...current, accountNumber: event.target.value }))
                }
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  className={controlClassName}
                  value={form.accountType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      accountType: event.target.value as CreateTradingAccountPayload["accountType"],
                    }))
                  }
                >
                  {["demo", "live", "prop", "challenge"].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <input
                  className={controlClassName}
                  placeholder="Broker"
                  value={form.broker}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, broker: event.target.value }))
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={controlClassName}
                  placeholder="Platform"
                  value={form.platform}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, platform: event.target.value }))
                  }
                  required
                />
                <input
                  className={controlClassName}
                  placeholder="Leverage"
                  value={form.leverage}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, leverage: event.target.value }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={controlClassName}
                  type="number"
                  min="0"
                  placeholder="Balance"
                  value={form.initialBalance || ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      initialBalance: Number(event.target.value),
                    }))
                  }
                  required
                />
                <input
                  className={controlClassName}
                  placeholder="Currency"
                  value={form.currency}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, currency: event.target.value }))
                  }
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                Create account
              </Button>
            </Card>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
