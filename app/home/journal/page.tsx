"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import { getTradingAccountsService } from "@/services/trading-account.service";
import { useJournalStore } from "@/stores/journal.store";
import type { JournalHistoryItem } from "@/types/journal.types";
import type { TradingAccount } from "@/types/trading-account.types";
import {
  Activity,
  ArrowUpRight,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  Clock3,
  NotebookPen,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);

const getAccountName = (journal: JournalHistoryItem) => {
  if (!journal.tradingAccount || typeof journal.tradingAccount === "string") {
    return "Trading account";
  }

  return `${journal.tradingAccount.accountName} - ${journal.tradingAccount.broker}`;
};

export default function JournalPage() {
  const journals = useJournalStore((state) => state.journals);
  const isLoading = useJournalStore((state) => state.isLoading);
  const error = useJournalStore((state) => state.error);
  const createJournal = useJournalStore((state) => state.createJournal);
  const getUserJournals = useJournalStore((state) => state.getUserJournals);

  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [beforeTrading, setBeforeTrading] = useState("");
  const [confidenceBefore, setConfidenceBefore] = useState(7);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadJournalPage = async () => {
      setIsLoadingAccounts(true);
      setAccountError(null);

      try {
        const [, accountsResponse] = await Promise.all([
          getUserJournals(),
          getTradingAccountsService(),
        ]);
        setAccounts(accountsResponse.data);
        setSelectedAccountId((current) => current || accountsResponse.data[0]?._id || "");
      } catch (loadError) {
        void loadError;
        setAccountError("Unable to load your journal workspace.");
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    loadJournalPage();
  }, [getUserJournals]);

  const filteredJournals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return journals;

    return journals.filter((journal) => {
      const accountName = getAccountName(journal).toLowerCase();
      const symbols = journal.trades?.map((trade) => trade.symbol).join(" ").toLowerCase() || "";
      const note = journal.psychology?.beforeTrading?.toLowerCase() || "";

      return accountName.includes(query) || symbols.includes(query) || note.includes(query);
    });
  }, [journals, searchTerm]);

  const stats = useMemo(
    () =>
      journals.reduce(
        (summary, journal) => ({
          journals: summary.journals + 1,
          trades: summary.trades + (journal.tradesCount || 0),
          openTrades: summary.openTrades + journal.openTrades,
          closedTrades: summary.closedTrades + journal.closedTrades,
          totalProfitLoss: summary.totalProfitLoss + journal.totalProfitLoss,
          winningTrades: summary.winningTrades + journal.winningTrades,
          losingTrades: summary.losingTrades + journal.losingTrades,
        }),
        {
          journals: 0,
          trades: 0,
          openTrades: 0,
          closedTrades: 0,
          totalProfitLoss: 0,
          winningTrades: 0,
          losingTrades: 0,
        },
      ),
    [journals],
  );

  const handleCreateJournal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    setAccountError(null);

    if (!selectedAccountId) {
      setAccountError("Select a trading account before creating a journal.");
      return;
    }

    try {
      await createJournal({
        tradingAccount: selectedAccountId,
        beforeTrading,
        confidenceBefore,
      });
      await getUserJournals();
      setBeforeTrading("");
      setConfidenceBefore(7);
      setSuccessMessage("Journal created.");
    } catch (createError) {
      void createError;
      setAccountError("Unable to create a journal right now.");
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Journal
            </p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
              Trading Journals
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Review every journal you have created, how many trades each one contains,
              and the performance tied to those sessions.
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              placeholder="Search journals, notes, symbols"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={BookOpenText} label="Journals" value={stats.journals} />
          <StatCard icon={Activity} label="Trades logged" value={stats.trades} />
          <StatCard
            icon={stats.totalProfitLoss >= 0 ? TrendingUp : TrendingDown}
            label="Net P/L"
            value={formatMoney(stats.totalProfitLoss)}
            tone={stats.totalProfitLoss >= 0 ? "positive" : "negative"}
          />
          <StatCard
            icon={CheckCircle2}
            label="Closed trades"
            value={stats.closedTrades}
            helper={`${stats.openTrades} open`}
          />
        </div>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_410px]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-card">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  All Journals
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {filteredJournals.length} shown from {journals.length} total
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <CalendarDays size={17} />
                Newest first
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-white/10">
              {isLoading && !journals.length ? (
                <EmptyState title="Loading journals" body="Your journal history is coming in." />
              ) : filteredJournals.length ? (
                filteredJournals.map((journal) => (
                  <JournalRow key={journal._id} journal={journal} />
                ))
              ) : (
                <EmptyState
                  title="No journals found"
                  body={
                    searchTerm
                      ? "Try a different symbol, account, or note."
                      : "Create your first journal from the panel on this page."
                  }
                />
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <form
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-card"
              onSubmit={handleCreateJournal}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Create
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                    New journal
                  </h2>
                </div>
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <NotebookPen size={21} />
                </div>
              </div>

              {(error || accountError || successMessage) && (
                <div
                  className={`mt-4 rounded-2xl px-3 py-2 text-sm ${
                    successMessage
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {successMessage || accountError || error}
                </div>
              )}

              <div className="mt-5 space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Trading account
                  <select
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    value={selectedAccountId}
                    onChange={(event) => setSelectedAccountId(event.target.value)}
                    disabled={isLoadingAccounts || !accounts.length}
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.accountName} - {account.broker}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Pre-market note
                  <textarea
                    className="mt-2 min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                    value={beforeTrading}
                    onChange={(event) => setBeforeTrading(event.target.value)}
                    placeholder="Bias, setup focus, emotional state"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Confidence: {confidenceBefore}/10
                  <input
                    className="mt-2 w-full accent-cyan-400"
                    type="range"
                    min="1"
                    max="10"
                    value={confidenceBefore}
                    onChange={(event) => setConfidenceBefore(Number(event.target.value))}
                  />
                </label>

                <Button
                  className="w-full"
                  type="submit"
                  disabled={isLoading || isLoadingAccounts || !accounts.length}
                >
                  <Plus size={18} />
                  {isLoading ? "Creating..." : "Create Journal"}
                </Button>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-card">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                <WalletCards size={17} />
                Journal quality
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <MiniMetric label="Winning trades" value={stats.winningTrades} />
                <MiniMetric label="Losing trades" value={stats.losingTrades} />
              </div>
            </div>
          </aside>
        </section>
      </div>
    </DashboardShell>
  );
}

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  helper?: string;
  tone?: "positive" | "negative";
};

function StatCard({ icon: Icon, label, value, helper, tone }: StatCardProps) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600 dark:text-emerald-300"
      : tone === "negative"
        ? "text-rose-600 dark:text-rose-300"
        : "text-slate-950 dark:text-white";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-card">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white">
          <Icon size={19} />
        </div>
      </div>
      <p className={`mt-4 text-3xl font-bold ${toneClass}`}>{value}</p>
      {helper && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helper}</p>}
    </div>
  );
}

function JournalRow({ journal }: { journal: JournalHistoryItem }) {
  const hasProfit = journal.totalProfitLoss >= 0;

  return (
    <article className="p-5 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-950 dark:text-white">
              {formatDate(journal.journalDate)}
            </h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
              {journal.status}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
            {getAccountName(journal)}
          </p>
          {journal.psychology?.beforeTrading && (
            <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
              {journal.psychology.beforeTrading}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:min-w-[430px]">
          <MiniMetric label="Trades" value={journal.tradesCount || 0} />
          <MiniMetric label="Open" value={journal.openTrades} />
          <MiniMetric label="Closed" value={journal.closedTrades} />
          <MiniMetric
            label="P/L"
            value={formatMoney(journal.totalProfitLoss)}
            className={hasProfit ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}
          />
        </div>
      </div>

      {journal.trades?.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {journal.trades.slice(0, 5).map((trade) => (
            <span
              key={trade._id}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
            >
              {trade.direction === "long" ? <ArrowUpRight size={13} /> : <TrendingDown size={13} />}
              {trade.symbol}
            </span>
          ))}
          {journal.trades.length > 5 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-400">
              +{journal.trades.length - 5} more
            </span>
          )}
        </div>
      ) : null}
    </article>
  );
}

function MiniMetric({
  label,
  value,
  className = "text-slate-950 dark:text-white",
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-100 px-3 py-2 dark:bg-white/[0.05]">
      <p className={`text-sm font-bold ${className}`}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
        <Clock3 size={20} />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{body}</p>
    </div>
  );
}
