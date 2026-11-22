"use client";

import AccountSwitcher from "@/components/dashboard/AccountSwitcher";
import DashboardShell from "@/components/dashboard/DashboardShell";
import VoiceNoteTextarea from "@/components/journal/VoiceNoteTextarea";
import ActionMenu from "@/components/ui/ActionMenu";
import Button from "@/components/ui/Button";
import HistoryModal from "@/components/ui/HistoryModal";
import HoverPreview from "@/components/ui/HoverPreview";
import PaginatedCollection from "@/components/ui/PaginatedCollection";
import SegmentedControl from "@/components/ui/SegmentedControl";
import {
  getJournalDisplayPnl,
  getSelectedAccount,
  getTradableAccounts,
  isAccountInPlay,
  needsNewAccount,
} from "@/lib/account";
import { formatMoney as formatAccountMoney } from "@/lib/format";
import { metricGridClassName, sectionStackClassName } from "@/lib/responsive";
import { getUserJournalsService } from "@/services/journal.service";
import { useAccountsStore } from "@/stores/accounts.store";
import { useJournalStore } from "@/stores/journal.store";
import { useNoticeStore } from "@/stores/notice.store";
import type { JournalHistoryItem } from "@/types/journal.types";
import {
  ArrowUpRight,
  BookOpenText,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  Link2,
  NotebookPen,
  Plus,
  Search,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

/** Fetch a working set; UI shows 5 per page via PaginatedCollection. */
const PREVIEW_LIMIT = 50;
const JOURNALS_PER_PAGE = 5;

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const getAccountName = (journal: JournalHistoryItem) => {
  if (!journal.tradingAccount || typeof journal.tradingAccount === "string") {
    return "Trading account";
  }

  return `${journal.tradingAccount.accountName} - ${journal.tradingAccount.broker}`;
};

export default function JournalPage() {
  const journals = useJournalStore((state) => state.journals);
  const journalPagination = useJournalStore((state) => state.journalPagination);
  const journalSummary = useJournalStore((state) => state.journalSummary);
  const isLoading = useJournalStore((state) => state.isLoading);
  const error = useJournalStore((state) => state.error);
  const createJournal = useJournalStore((state) => state.createJournal);
  const getUserJournals = useJournalStore((state) => state.getUserJournals);

  const accounts = useAccountsStore((state) => state.accounts);
  const storeSelectedAccountId = useAccountsStore(
    (state) => state.selectedAccountId,
  );
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const selectAccount = useAccountsStore((state) => state.selectAccount);
  const selectedAccount = getSelectedAccount(accounts, storeSelectedAccountId);
  const tradableAccounts = getTradableAccounts(accounts);
  const currency =
    selectedAccount?.accountCurrency || selectedAccount?.currency || "USD";
  const reportingCurrency =
    journalSummary?.reportingCurrency ||
    journals[0]?.reportingCurrency ||
    currency;
  const reportingConversionUnavailable = Boolean(
    journalSummary?.conversionUnavailableCount ||
      journals.some((journal) => (journal.conversionUnavailableCount || 0) > 0),
  );
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [beforeTrading, setBeforeTrading] = useState("");
  const [confidenceBefore, setConfidenceBefore] = useState(7);
  const [searchTerm, setSearchTerm] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") || "";
  });
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createStatus, setCreateStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [journalView, setJournalView] = useState<"list" | "grid">("list");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<JournalHistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyHasMore, setHistoryHasMore] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (createStatus !== "success" && createStatus !== "error") return;
    const timer = window.setTimeout(() => setCreateStatus("idle"), 1600);
    return () => window.clearTimeout(timer);
  }, [createStatus]);

  const loadPreview = useCallback(async () => {
    await getUserJournals({
      page: 1,
      limit: PREVIEW_LIMIT,
      q: debouncedSearch || undefined,
      includeSummary: true,
    });
  }, [debouncedSearch, getUserJournals]);

  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoadingAccounts(true);
      setAccountError(null);
      try {
        const loadedAccounts = await fetchAccounts();
        const preferred = getSelectedAccount(
          loadedAccounts,
          storeSelectedAccountId,
        );
        setSelectedAccountId((current) => current || preferred?._id || "");
        if (needsNewAccount(loadedAccounts)) {
          setAccountError(
            "Create a trading account before starting a journal.",
          );
        }
      } catch (loadError) {
        void loadError;
        setAccountError("Unable to load your journal workspace.");
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    void loadAccounts();
  }, [fetchAccounts, storeSelectedAccountId]);

  useEffect(() => {
    void loadPreview().catch(() => undefined);
  }, [loadPreview]);

  const loadHistoryPage = useCallback(
    async (page: number, { reset = false } = {}) => {
      setHistoryLoading(true);
      setHistoryError(null);
      try {
        const response = await getUserJournalsService({
          page,
          limit: PREVIEW_LIMIT,
          q: debouncedSearch || undefined,
        });
        setHistoryItems((current) => {
          const incoming = response.data || [];
          if (reset) return incoming;
          const seen = new Set(current.map((item) => item._id));
          return [
            ...current,
            ...incoming.filter((item) => !seen.has(item._id)),
          ];
        });
        setHistoryPage(page);
        setHistoryHasMore(Boolean(response.pagination?.hasMore));
      } catch (loadError) {
        void loadError;
        setHistoryError("Unable to load more journal history.");
      } finally {
        setHistoryLoading(false);
      }
    },
    [debouncedSearch],
  );
  useEffect(() => {
    if (!historyOpen) return;
    void loadHistoryPage(1, { reset: true });
  }, [debouncedSearch, historyOpen, loadHistoryPage]);

  const stats = useMemo(() => {
    if (journalSummary) {
      return {
        journals: journalSummary.journals,
        trades: journalSummary.trades,
        openTrades: journalSummary.openTrades,
        closedTrades: journalSummary.closedTrades,
        totalProfitLoss:
          journalSummary.totalProfitLossReporting ??
          journalSummary.totalProfitLoss,
        winningTrades: journalSummary.winningTrades,
        losingTrades: journalSummary.losingTrades,
      };
    }

    return journals.reduce(
      (summary, journal) => ({
        journals: summary.journals + 1,
        trades: summary.trades + (journal.tradesCount || 0),
        openTrades: summary.openTrades + journal.openTrades,
        closedTrades: summary.closedTrades + journal.closedTrades,
        totalProfitLoss:
          summary.totalProfitLoss +
          (journal.totalProfitLossReporting ?? journal.totalProfitLoss),
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
    );
  }, [journalSummary, journals]);

  const previewHasMore = Boolean(
    journalPagination?.hasMore ||
      (journalPagination?.total || 0) > journals.length,
  );


  const openHistory = async () => {
    setHistoryOpen(true);
    setHistoryItems([]);
    setHistoryHasMore(false);
    await loadHistoryPage(1, { reset: true });
  };

  const handleCreateJournal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);
    setAccountError(null);

    const account = accounts.find((item) => item._id === selectedAccountId);
    if (!selectedAccountId || !isAccountInPlay(account)) {
      setAccountError(
        needsNewAccount(accounts)
          ? "Create a trading account before starting a journal."
          : "This account has passed or been breached. Create a new account first.",
      );
      return;
    }

    setCreateStatus("loading");
    try {
      await selectAccount(selectedAccountId);
      await createJournal({
        tradingAccount: selectedAccountId,
        beforeTrading,
        confidenceBefore,
      });
      await loadPreview();
      setBeforeTrading("");
      setConfidenceBefore(7);
      setSuccessMessage("Journal created.");
      setCreateStatus("success");
    } catch (createError) {
      void createError;
      setAccountError("Unable to create a journal right now.");
      setCreateStatus("error");
    }
  };

  return (
    <DashboardShell>
      <div className={sectionStackClassName}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Journal
            </p>
            <h1 className="mt-1 break-words text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white">
              Trading Journals
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              Review recent sessions first, then open full history when you need
              the complete archive.
            </p>
          </div>

          <div className="relative w-full min-w-0 lg:max-w-sm">
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

        <div className={metricGridClassName}>
          <StatCard
            icon={BookOpenText}
            label="Journals"
            value={stats.journals}
          />
          <StatCard
            icon={Database}
            label="Trades logged"
            value={stats.trades}
          />
          <StatCard
            icon={stats.totalProfitLoss >= 0 ? TrendingUp : TrendingDown}
            label="Net P/L"
            value={
              reportingConversionUnavailable
                ? "Unavailable"
                : formatAccountMoney(stats.totalProfitLoss, reportingCurrency)
            }
            tone={stats.totalProfitLoss >= 0 ? "positive" : "negative"}
            helper={
              reportingConversionUnavailable
                ? "Some currency rates are unavailable"
                : undefined
            }
          />
          <StatCard
            icon={CheckCircle2}
            label="Closed trades"
            value={stats.closedTrades}
            helper={`${stats.openTrades} open`}
          />
        </div>

        <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(260px,300px)]">
          <div className="min-w-0 overflow-hidden rounded-card border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                    Daily journals
                  </h2>
                  <AccountSwitcher compact />
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {journalPagination?.total
                    ? `${journalPagination.total} sessions`
                    : `${journals.length} loaded`}{" "}
                  · newest first · {JOURNALS_PER_PAGE} per page
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 text-sm text-slate-500 dark:text-slate-400">
                {previewHasMore ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-9 px-3 text-xs"
                    onClick={() => void openHistory()}
                  >
                    Full history
                  </Button>
                ) : null}
                <SegmentedControl
                  ariaLabel="Journal display mode"
                  value={journalView}
                  onChange={setJournalView}
                  options={[
                    { value: "list", label: "List" },
                    { value: "grid", label: "Grid" },
                  ]}
                />
              </div>
            </div>

            <div className="p-0 sm:p-0">
              {isLoading && !journals.length ? (
                <EmptyState
                  title="Loading journals"
                  body="Your journal history is coming in."
                />
              ) : journals.length ? (
                <PaginatedCollection
                  items={journals}
                  itemsPerPage={JOURNALS_PER_PAGE}
                  getKey={(journal) => journal._id}
                  listClassName={
                    journalView === "list"
                      ? "divide-y divide-border"
                      : "grid gap-3 p-3 sm:grid-cols-2"
                  }
                  renderItem={(journal) => (
                    <JournalRow journal={journal} view={journalView} />
                  )}
                />
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

          <aside className="min-w-0 space-y-3 xl:sticky xl:top-8">
            <form
              className="rounded-card border border-border bg-card p-3.5 shadow-sm sm:p-4"
              onSubmit={handleCreateJournal}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    Create
                  </p>
                  <h2 className="mt-0.5 text-base font-semibold text-slate-950 dark:text-white">
                    New journal
                  </h2>
                </div>
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-control bg-primary/15 text-primary">
                  <NotebookPen size={16} />
                </div>
              </div>

              {(error || accountError || successMessage) && (
                <div
                  className={`mt-3 rounded-lg px-3 py-2 text-xs ${
                    successMessage
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  {successMessage || accountError || error}
                </div>
              )}

              <div className="mt-3 space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Trading account
                  <select
                    className="mt-1.5 h-9 w-full rounded-control border border-border bg-white px-2.5 text-sm text-slate-900 outline-none focus:border-primary dark:bg-white/[0.04] dark:text-white"
                    value={selectedAccountId}
                    onChange={(event) =>
                      setSelectedAccountId(event.target.value)
                    }
                    disabled={isLoadingAccounts || !accounts.length}
                    required
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => {
                      const inPlay = isAccountInPlay(account);
                      return (
                        <option
                          key={account._id}
                          value={account._id}
                          disabled={!inPlay}
                        >
                          {account.accountName} - {account.broker} ·{" "}
                          {account.accountCurrency || account.currency}
                          {inPlay ? "" : ` · ${account.status}`}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <VoiceNoteTextarea
                  label="Pre-market note"
                  value={beforeTrading}
                  onChange={setBeforeTrading}
                  placeholder="Bias, setup focus, emotional state"
                  helperText="Dictate your prep note if typing feels heavy."
                  textareaClassNameOverride="mt-0 min-h-20 w-full resize-none rounded-control border border-border bg-white px-2.5 py-2 text-sm text-slate-900 outline-none focus:border-primary dark:bg-white/[0.04] dark:text-white"
                />

                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Confidence: {confidenceBefore}/10
                  <input
                    className="mt-1.5 w-full accent-cyan-400"
                    type="range"
                    min="1"
                    max="10"
                    value={confidenceBefore}
                    onChange={(event) =>
                      setConfidenceBefore(Number(event.target.value))
                    }
                  />
                </label>

                <Button
                  className="h-9 w-full whitespace-nowrap"
                  type="submit"
                  status={createStatus}
                  successLabel="Created"
                  errorLabel="Failed"
                  disabled={
                    isLoadingAccounts ||
                    !tradableAccounts.length ||
                    createStatus === "loading"
                  }
                >
                  <Plus size={15} />
                  Create Journal
                </Button>
              </div>
            </form>

            <div className="rounded-card border border-border bg-card p-3.5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                <WalletCards size={15} />
                Journal quality
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2 text-sm">
                <MiniMetric
                  label="Winning trades"
                  value={stats.winningTrades}
                />
                <MiniMetric label="Losing trades" value={stats.losingTrades} />
              </div>
            </div>
          </aside>
        </section>
      </div>

      <HistoryModal
        open={historyOpen}
        title="Full journal history"
        eyebrow="Journals"
        onClose={() => setHistoryOpen(false)}
        hasMore={historyHasMore}
        loadingMore={historyLoading}
        onLoadMore={() => {
          if (historyLoading || !historyHasMore) return;
          void loadHistoryPage(historyPage + 1);
        }}
      >
        {historyError ? (
          <p className="mb-4 text-sm text-rose-700 dark:text-rose-300">
            {historyError}
          </p>
        ) : null}
        {historyLoading && !historyItems.length ? (
          <EmptyState
            title="Loading history"
            body="Pulling your full journal archive."
          />
        ) : historyItems.length ? (
          <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
            {historyItems.map((journal) => (
              <JournalRow key={journal._id} journal={journal} view="list" />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No journals found"
            body={
              searchTerm
                ? "Try a different search term."
                : "Create your first journal to build history."
            }
          />
        )}
      </HistoryModal>
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
    <div className="min-w-0 rounded-card border border-border bg-card p-3 shadow-sm sm:p-3.5">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <div className="grid h-7 w-7 shrink-0 place-items-center rounded-control bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white">
          <Icon size={14} />
        </div>
      </div>
      <p className={`mt-2 break-words text-lg font-semibold sm:text-xl ${toneClass}`}>
        {value}
      </p>
      {helper && (
        <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
          {helper}
        </p>
      )}
    </div>
  );
}

function JournalRow({
  journal,
  view,
}: {
  journal: JournalHistoryItem;
  view: "list" | "grid";
}) {
  const router = useRouter();
  const showNotice = useNoticeStore((state) => state.showNotice);
  const display = getJournalDisplayPnl(journal);
  const displayPnl = display.value;
  const hasProfit = displayPnl >= 0;
  const currency = display.currency;
  const href = `/home/journal/${journal._id}`;
  const statusLabel = journal.status === "Completed" ? "Closed" : "Open";
  const dateLabel = formatDate(journal.journalDate);

  const copyLink = async () => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}${href}`
        : href;
    try {
      await navigator.clipboard.writeText(url);
      showNotice({
        title: "Link copied",
        body: `Session link for ${dateLabel} is on your clipboard.`,
        tone: "success",
        duration: 4000,
      });
    } catch {
      showNotice({
        title: "Could not copy link",
        body: "Clipboard access was blocked.",
        tone: "warning",
      });
    }
  };

  return (
    <HoverPreview
      className={view === "grid" ? "min-w-0" : undefined}
      preview={
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-950 dark:text-white">
              {dateLabel}
            </p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                journal.status === "Completed"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-sky-500/10 text-sky-700 dark:text-sky-300"
              }`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {getAccountName(journal)}
          </p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
            <span>{journal.tradesCount || 0} trades</span>
            <span>
              {journal.openTrades} open · {journal.closedTrades} closed
            </span>
            <span
              className={
                hasProfit
                  ? "font-semibold text-emerald-600 dark:text-emerald-300"
                  : "font-semibold text-rose-600 dark:text-rose-300"
              }
            >
              {formatAccountMoney(displayPnl, currency)}
            </span>
          </div>
          {journal.psychology?.beforeTrading ? (
            <p className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
              {journal.psychology.beforeTrading}
            </p>
          ) : null}
        </div>
      }
    >
      <div
        className={`relative ${
          view === "grid"
            ? "rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.025]"
            : ""
        }`}
      >
        <Link
          href={href}
          className="block p-4 pr-14 transition hover:bg-slate-50 dark:hover:bg-white/[0.03] sm:p-5 sm:pr-14"
        >
          <article className="min-w-0">
            <div
              className={`flex flex-col gap-4 ${
                view === "list"
                  ? "xl:flex-row xl:items-start xl:justify-between"
                  : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-bold text-slate-950 dark:text-white">
                    {dateLabel}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      journal.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        : "bg-sky-500/10 text-sky-700 dark:text-sky-300"
                    }`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  {getAccountName(journal)}
                </p>
                {view === "list" && journal.psychology?.beforeTrading ? (
                  <p className="juvo-break-words mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                    {journal.psychology.beforeTrading}
                  </p>
                ) : null}
              </div>

              <div
                className={`grid w-full gap-2 ${
                  view === "list"
                    ? "grid-cols-2 sm:grid-cols-4 xl:w-[280px] xl:shrink-0"
                    : "grid-cols-2"
                }`}
              >
                <MiniMetric label="Trades" value={journal.tradesCount || 0} />
                {view === "list" ? (
                  <>
                    <MiniMetric label="Open" value={journal.openTrades} />
                    <MiniMetric label="Closed" value={journal.closedTrades} />
                  </>
                ) : null}
                <MiniMetric
                  label="P/L"
                  value={formatAccountMoney(displayPnl, currency)}
                  className={
                    hasProfit
                      ? "text-emerald-600 dark:text-emerald-300"
                      : "text-rose-600 dark:text-rose-300"
                  }
                />
              </div>
            </div>

            {view === "list" && journal.trades?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {journal.trades.slice(0, 5).map((trade) => (
                  <span
                    key={trade._id}
                    className="inline-flex max-w-full items-center gap-1 truncate rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:text-slate-300"
                  >
                    {trade.direction === "long" ? (
                      <ArrowUpRight size={13} />
                    ) : (
                      <TrendingDown size={13} />
                    )}
                    {trade.symbol}
                  </span>
                ))}
                {journal.trades.length > 5 ? (
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-400">
                    +{journal.trades.length - 5} more
                  </span>
                ) : null}
              </div>
            ) : null}
          </article>
        </Link>

        <div
          className="absolute right-2 top-2 z-10 sm:right-3 sm:top-3"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <ActionMenu
            label={`Actions for ${dateLabel}`}
            items={[
              {
                id: "open",
                label: "Open",
                icon: <ExternalLink size={14} />,
                onSelect: () => router.push(href),
              },
              {
                id: "copy-link",
                label: "Copy link",
                icon: <Link2 size={14} />,
                onSelect: () => void copyLink(),
              },
            ]}
          />
        </div>
      </div>
    </HoverPreview>
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
    <div className="min-w-0 rounded-xl bg-slate-100 px-3 py-2 dark:bg-white/[0.05]">
      <p className={`truncate text-sm font-bold ${className}`}>{value}</p>
      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-300">
        <Clock3 size={20} />
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-950 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {body}
      </p>
    </div>
  );
}
