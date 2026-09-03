"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { formatMoney, formatNumber, pnlClass } from "@/lib/format";
import { controlClassName } from "@/lib/ui";
import { useAccountsStore } from "@/stores/accounts.store";
import {
  CreateTradingAccountPayload,
  TradingAccount,
  TradingAccountStatus,
} from "@/types/trading-account.types";
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

const statusStyles: Record<TradingAccountStatus, string> = {
  Active:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  Passed: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  Breached: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

function AccountStatusBadge({ account }: { account: TradingAccount }) {
  const status = account.status || "Active";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}
      >
        {status}
      </span>
      {account.isActive ? (
        <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
          Active account
        </span>
      ) : null}
    </div>
  );
}

function ProgressBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "target" | "drawdown";
}) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          {formatNumber(width, 1)}%
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-white/10">
        <div
          className={`h-full rounded-full ${
            tone === "drawdown" ? "bg-rose-500" : "bg-primary"
          }`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function TradingAccountsPage() {
  const accounts = useAccountsStore((state) => state.accounts);
  const isLoading = useAccountsStore((state) => state.isLoading);
  const error = useAccountsStore((state) => state.error);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const createAccount = useAccountsStore((state) => state.createAccount);
  const activateAccount = useAccountsStore((state) => state.activateAccount);
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
          description="Every journal is tied to an account. Demo, live, prop, or challenge — keep them separate, and only the active account collects new trades."
        />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-4">
            {accounts.length ? (
              accounts.map((account) => {
                const targetProgress = account.profitTarget
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        ((account.profitPercent || 0) / account.profitTarget) *
                          100,
                      ),
                    )
                  : Math.max(0, account.profitPercent || 0);
                const drawdownProgress = account.maxDrawnDown
                  ? Math.min(
                      100,
                      Math.max(
                        0,
                        ((account.drawdownPercent || 0) /
                          account.maxDrawnDown) *
                          100,
                      ),
                    )
                  : Math.max(0, account.drawdownPercent || 0);

                return (
                  <Card key={account._id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-lg font-bold text-slate-950 dark:text-white">
                          {account.accountName}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {account.broker} · {account.platform} ·{" "}
                          {account.accountType}
                        </p>
                        <div className="mt-3">
                          <AccountStatusBadge account={account} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!account.isActive &&
                        (account.status || "Active") === "Active" ? (
                          <Button
                            variant="ghost"
                            className="h-9 px-3"
                            onClick={() => activateAccount(account._id)}
                            disabled={isLoading}
                          >
                            Set active
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          className="h-9 px-3"
                          onClick={() => deleteAccount(account._id)}
                        >
                          Archive
                        </Button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {[
                        [
                          "Balance",
                          formatMoney(account.currentBalance, account.currency),
                        ],
                        [
                          "Equity",
                          formatMoney(account.currentEquity, account.currency),
                        ],
                        ["Trades", String(account.tradesCount || 0)],
                        ["Target", `${formatNumber(account.profitTarget)}%`],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/[0.04]"
                        >
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {label}
                          </p>
                          <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <ProgressBar
                        label={`Profit target ${formatNumber(account.profitTarget)}%`}
                        value={targetProgress}
                        tone="target"
                      />
                      <ProgressBar
                        label={`Max drawdown ${formatNumber(account.maxDrawnDown)}%`}
                        value={drawdownProgress}
                        tone="drawdown"
                      />
                    </div>
                    {account.trades?.length ? (
                      <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                          Account trades
                        </p>
                        <div className="mt-3 space-y-2">
                          {account.trades.slice(0, 6).map((trade) => (
                            <div
                              key={trade._id}
                              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/[0.04]"
                            >
                              <div>
                                <p className="font-semibold text-slate-950 dark:text-white">
                                  {trade.symbol} · {trade.direction}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {trade.status}
                                  {trade.session ? ` · ${trade.session}` : ""}
                                </p>
                              </div>
                              <p
                                className={`font-bold ${pnlClass(trade.profitLoss || 0)}`}
                              >
                                {formatMoney(
                                  trade.profitLoss || 0,
                                  account.currency,
                                )}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        Trades logged while this account is active will appear
                        here.
                      </p>
                    )}
                  </Card>
                );
              })
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
              <div className="grid grid-cols-2 gap-3">
                <input
                  className={controlClassName}
                  type="number"
                  min="0"
                  placeholder="Max drawdown %"
                  value={form.maxDrawnDown || ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      maxDrawnDown: Number(event.target.value),
                    }))
                  }
                />
                <input
                  className={controlClassName}
                  type="number"
                  min="0"
                  placeholder="Profit target %"
                  value={form.profitTarget || ""}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      profitTarget: Number(event.target.value),
                    }))
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
