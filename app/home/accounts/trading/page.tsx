"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import ActionMenu from "@/components/ui/ActionMenu";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import HoverPreview from "@/components/ui/HoverPreview";
import PageHeader from "@/components/ui/PageHeader";
import PaginatedCollection from "@/components/ui/PaginatedCollection";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { formatMoney } from "@/lib/format";
import { controlClassName } from "@/lib/ui";
import { sectionStackClassName } from "@/lib/responsive";
import { useAccountsStore } from "@/stores/accounts.store";
import { useNoticeStore } from "@/stores/notice.store";
import {
  CreateTradingAccountPayload,
  TradingAccount,
  TradingAccountStatus,
} from "@/types/trading-account.types";
import { Archive, RotateCcw, WalletCards } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const ACCOUNTS_PER_PAGE = 5;

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

export default function TradingAccountsPage() {
  const accounts = useAccountsStore((state) => state.accounts);
  const archivedAccounts = useAccountsStore((state) => state.archivedAccounts);
  const isLoading = useAccountsStore((state) => state.isLoading);
  const error = useAccountsStore((state) => state.error);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const fetchArchivedAccounts = useAccountsStore(
    (state) => state.fetchArchivedAccounts,
  );
  const createAccount = useAccountsStore((state) => state.createAccount);
  const activateAccount = useAccountsStore((state) => state.activateAccount);
  const archiveAccount = useAccountsStore((state) => state.archiveAccount);
  const restoreAccount = useAccountsStore((state) => state.restoreAccount);
  const showNotice = useNoticeStore((state) => state.showNotice);
  const [form, setForm] = useState(defaultForm);
  const [view, setView] = useState<"active" | "archived">("active");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAccounts().catch(() => undefined);
    fetchArchivedAccounts().catch(() => undefined);
  }, [fetchAccounts, fetchArchivedAccounts]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreating(true);
    try {
      await createAccount(form);
      setForm(defaultForm);
      showNotice({
        title: "Account created",
        body: `${form.accountName || "Trading account"} is ready to use.`,
        tone: "success",
      });
    } catch {
      showNotice({
        title: "Could not create account",
        body: "Check the details and try again.",
        tone: "warning",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleArchive = async (account: TradingAccount) => {
    await archiveAccount(account._id);
    showNotice({
      title: "Account archived",
      body: `${account.accountName} was moved to archive.`,
      tone: "info",
      undoLabel: "Undo",
      onUndo: async () => {
        await restoreAccount(account._id);
      },
    });
  };

  return (
    <DashboardShell>
      <div className={sectionStackClassName}>
        <PageHeader
          eyebrow="Accounts"
          title="Trading Accounts"
          description="Every journal is tied to an account. Active accounts can collect new trades; archived accounts stay available for review."
          actions={
            <SegmentedControl
              ariaLabel="Account view"
              size="md"
              value={view}
              onChange={setView}
              options={[
                { value: "active", label: `Active ${accounts.length}` },
                {
                  value: "archived",
                  label: `Archived ${archivedAccounts.length}`,
                },
              ]}
            />
          }
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
          <div className="min-w-0">
            {view === "archived" ? (
              archivedAccounts.length ? (
                <PaginatedCollection
                  items={archivedAccounts}
                  itemsPerPage={ACCOUNTS_PER_PAGE}
                  getKey={(account) => account._id}
                  listClassName="space-y-3"
                  renderItem={(account) => (
                    <ArchivedAccountCard
                      account={account}
                      onRestore={() => restoreAccount(account._id)}
                      isLoading={isLoading}
                    />
                  )}
                />
              ) : (
                <Card>
                  <EmptyState
                    icon={Archive}
                    title={isLoading ? "Loading archive" : "No archived accounts"}
                    body="Archived accounts will appear here with their old trades and account history."
                  />
                </Card>
              )
            ) : accounts.length ? (
              <PaginatedCollection
                items={accounts}
                itemsPerPage={ACCOUNTS_PER_PAGE}
                getKey={(account) => account._id}
                listClassName="space-y-3"
                renderItem={(account) => {
                  const currency =
                    account.accountCurrency || account.currency || "USD";
                  const pnl = (account.currentEquity ?? 0) - (account.initialBalance ?? 0);
                  return (
                    <Card className="min-w-0 p-3.5 sm:p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <HoverPreview
                          className="min-w-0 flex-1"
                          preview={
                            <div className="space-y-1.5">
                              <p className="font-semibold text-slate-950 dark:text-white">
                                {account.accountName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {account.broker} · {account.platform || "Broker"} ·{" "}
                                {account.status || "Active"}
                              </p>
                              <p className="text-sm tabular-nums text-slate-700 dark:text-slate-200">
                                Equity {formatMoney(account.currentEquity, currency)} · Est. P/L{" "}
                                {formatMoney(pnl, currency)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {account.tradesCount || 0} logged trades
                              </p>
                            </div>
                          }
                        >
                          <div className="min-w-0">
                            <p className="break-words text-base font-semibold text-slate-950 dark:text-white">
                              {account.accountName}
                            </p>
                            <p className="juvo-break-words mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                              {account.platform || "Broker"} — {account.broker} ·{" "}
                              {account.accountType}
                            </p>
                            <div className="mt-2">
                              <AccountStatusBadge account={account} />
                            </div>
                          </div>
                        </HoverPreview>
                        <div className="flex items-center gap-2">
                          <Link href="/home/analytics">
                            <Button variant="ghost" className="h-9 px-3">
                              View account
                            </Button>
                          </Link>
                          <ActionMenu
                            label={`Actions for ${account.accountName}`}
                            items={[
                              ...(!account.isActive &&
                              (account.status || "Active") === "Active"
                                ? [
                                    {
                                      id: "activate",
                                      label: "Set active",
                                      disabled: isLoading,
                                      onSelect: () =>
                                        activateAccount(account._id),
                                    },
                                  ]
                                : []),
                              {
                                id: "archive",
                                label: "Archive",
                                tone: "danger" as const,
                                icon: <Archive size={14} />,
                                onSelect: () => handleArchive(account),
                              },
                            ]}
                          />
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {[
                          [
                            "Balance",
                            formatMoney(account.currentBalance, currency),
                          ],
                          [
                            "Est. P/L",
                            formatMoney(pnl, currency),
                          ],
                          ["Trades", String(account.tradesCount || 0)],
                          [
                            "Equity",
                            formatMoney(account.currentEquity, currency),
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="min-w-0 rounded-control bg-slate-50 px-2.5 py-2 dark:bg-white/[0.04]"
                          >
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {label}
                            </p>
                            <p className="mt-0.5 break-words text-sm font-semibold text-slate-950 dark:text-white">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  );
                }}
              />
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

          <form onSubmit={handleCreate} className={`min-w-0 ${view === "archived" ? "hidden xl:block" : ""}`}>
            <Card className="space-y-2.5 p-3.5 sm:p-4">
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
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
              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
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
              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
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
              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
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
              <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2">
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
              <Button
                className="w-full"
                type="submit"
                loading={creating || isLoading}
                successLabel="Created"
              >
                Create account
              </Button>
            </Card>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}

function ArchivedAccountCard({
  account,
  isLoading,
  onRestore,
}: {
  account: TradingAccount;
  isLoading: boolean;
  onRestore: () => void;
}) {
  return (
    <Card className="p-3.5 sm:p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold text-slate-950 dark:text-white">
              {account.accountName}
            </p>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
              Archived
            </span>
          </div>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {account.broker} · {account.platform} · {account.accountType}
          </p>
        </div>
        <Button
          variant="ghost"
          className="h-9 px-3"
          onClick={onRestore}
          disabled={isLoading}
        >
          <RotateCcw size={16} />
          Restore
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          [
            "Balance",
            formatMoney(account.currentBalance, account.accountCurrency || account.currency),
          ],
          [
            "Equity",
            formatMoney(account.currentEquity, account.accountCurrency || account.currency),
          ],
          ["Trades", String(account.tradesCount || 0)],
          [
            "P/L",
            formatMoney(account.totalProfitLoss || 0, account.accountCurrency || account.currency),
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-control bg-slate-50 px-2.5 py-2 dark:bg-white/[0.04]"
          >
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-0.5 text-sm font-semibold text-slate-950 dark:text-white">
              {value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
