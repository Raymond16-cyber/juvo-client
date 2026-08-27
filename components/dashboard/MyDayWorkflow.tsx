"use client";

import Button from "@/components/ui/Button";
import {
  animateJournalSequence,
  animateJournalStateChange,
} from "@/animations/journal";
import {
  createTradingAccountService,
  getTradingAccountsService,
} from "@/services/trading-account.service";
import { useJournalStore } from "@/stores/journal.store";
import { CreateTradePayload } from "@/types/journal.types";
import {
  CreateTradingAccountPayload,
  TradingAccount,
} from "@/types/trading-account.types";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  NotebookPen,
  Plus,
  WalletCards,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type WorkflowPanel = "start" | "trade" | "account";

type MyDayWorkflowProps = {
  initialPanel?: WorkflowPanel;
  mode?: "card" | "modal";
  onJournalUpdated?: () => void;
};

const defaultAccountForm: CreateTradingAccountPayload = {
  accountName: "",
  accountNumber: "",
  accountType: "demo",
  broker: "",
  initialBalance: 0,
  platform: "",
  server: "",
  leverage: "1:100",
  currency: "USD",
  maxDrawnDown: 0,
  profitTarget: 0,
};

const defaultTradeForm: CreateTradePayload = {
  symbol: "",
  instrument: "forex",
  direction: "long",
  entryPrice: 0,
  stopLoss: 0,
  takeProfit: 0,
  lotSize: 0,
  riskPercentage: 1,
  plannedRR: 2,
  session: "London",
  notes: "",
};

export default function MyDayWorkflow({
  initialPanel = "start",
  mode = "card",
  onJournalUpdated,
}: MyDayWorkflowProps) {
  const workflowRef = useRef<HTMLElement>(null);
  const journalStatus = useJournalStore((state) => state.journalStatus);
  const isJournalLoading = useJournalStore((state) => state.isLoading);
  const journalError = useJournalStore((state) => state.error);
  const createJournal = useJournalStore((state) => state.createJournal);
  const createTrade = useJournalStore((state) => state.createTrade);
  const getTodayJournalStatus = useJournalStore(
    (state) => state.getTodayJournalStatus,
  );

  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [beforeTrading, setBeforeTrading] = useState("");
  const [confidenceBefore, setConfidenceBefore] = useState(7);
  const [accountForm, setAccountForm] = useState(defaultAccountForm);
  const [tradeForm, setTradeForm] = useState(defaultTradeForm);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [panel, setPanel] = useState<WorkflowPanel>(initialPanel);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const journal = journalStatus?.journal;
  const hasJournalToday = Boolean(journalStatus?.hasJournalToday && journal);
  const journalPrompts = hasJournalToday
    ? ["Welcome back.", "You've already started your day.", "Continue your journal."]
    : [
        "Good morning.",
        "Let's prepare for today's trading.",
        "How are you feeling today?",
        "What is your market bias?",
        "What are you watching?",
        "What is your risk today?",
      ];

  const selectedAccount = useMemo(
    () => accounts.find((account) => account._id === selectedAccountId),
    [accounts, selectedAccountId],
  );

  useEffect(() => {
    const loadWorkflow = async () => {
      setIsLoadingAccounts(true);
      setAccountError(null);

      try {
        const [accountResponse, statusResponse] = await Promise.all([
          getTradingAccountsService(),
          getTodayJournalStatus(),
        ]);
        setAccounts(accountResponse.data);
        setSelectedAccountId((current) => current || accountResponse.data[0]?._id || "");
        if (!accountResponse.data.length) {
          setPanel("account");
        } else if (initialPanel === "trade" && !statusResponse.data.hasJournalToday) {
          setPanel("start");
        }
      } catch (error) {
        void error;
        setAccountError("Unable to load trading accounts.");
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    loadWorkflow();
  }, [getTodayJournalStatus, initialPanel]);

  useEffect(() => {
    const handleOpenMyDay = (event: Event) => {
      const nextHasJournalToday =
        event instanceof CustomEvent &&
        typeof event.detail?.hasJournalToday === "boolean"
          ? event.detail.hasJournalToday
          : hasJournalToday;

      setPanel(nextHasJournalToday ? "trade" : accounts.length ? "start" : "account");
    };

    window.addEventListener("juvo:open-my-day", handleOpenMyDay);

    return () => {
      window.removeEventListener("juvo:open-my-day", handleOpenMyDay);
    };
  }, [accounts.length, hasJournalToday]);

  useEffect(() => {
    return animateJournalSequence(workflowRef.current);
  }, [hasJournalToday]);

  useEffect(() => {
    return animateJournalStateChange(workflowRef.current);
  }, [panel]);

  const handleCreateAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingAccount(true);
    setAccountError(null);
    setSuccessMessage(null);

    try {
      const response = await createTradingAccountService(accountForm);
      setAccounts((current) => [response.data, ...current]);
      setSelectedAccountId(response.data._id);
      setAccountForm(defaultAccountForm);
      setPanel("start");
      setSuccessMessage("Trading account created.");
    } catch (error) {
      void error;
      setAccountError("Unable to create trading account.");
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const handleStartDay = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);

    if (!selectedAccountId) {
      setAccountError("Select or create a trading account first.");
      setPanel("account");
      return;
    }

    await createJournal({
      tradingAccount: selectedAccountId,
      beforeTrading,
      confidenceBefore,
    });
    setSuccessMessage("Your day journal is ready.");
    setPanel("trade");
    onJournalUpdated?.();
  };

  const handleCreateTrade = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);

    if (!journal?._id) return;

    await createTrade(journal._id, tradeForm);
    setTradeForm(defaultTradeForm);
    setSuccessMessage("Trade added to today's journal.");
    onJournalUpdated?.();
  };

  const updateAccountForm = (
    key: keyof CreateTradingAccountPayload,
    value: string,
  ) => {
    setAccountForm((current) => ({
      ...current,
      [key]: ["initialBalance", "maxDrawnDown", "profitTarget"].includes(key)
        ? Number(value)
        : value,
    }));
  };

  const updateTradeForm = (key: keyof CreateTradePayload, value: string) => {
    setTradeForm((current) => ({
      ...current,
      [key]: [
        "entryPrice",
        "stopLoss",
        "takeProfit",
        "lotSize",
        "riskPercentage",
        "plannedRR",
      ].includes(key)
        ? Number(value)
        : value,
    }));
  };

  return (
    <section
      ref={workflowRef}
      data-dashboard-card
      data-journal-state
      className={`dashboard-card ${
        mode === "modal"
          ? "bg-white dark:bg-card"
          : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            My Day
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            {hasJournalToday ? "Journal started" : "Start your journal"}
          </h2>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          {hasJournalToday ? <CheckCircle2 size={21} /> : <NotebookPen size={21} />}
        </div>
      </div>

      <div
        className={`mt-5 space-y-2 ${mode === "modal" ? "rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]" : ""}`}
        aria-live="polite"
      >
        {journalPrompts.map((prompt, index) => (
          <p
            key={prompt}
            data-journal-prompt
            className={`text-sm ${
              index === 0
                ? "font-bold text-slate-950 dark:text-white"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {prompt}
          </p>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 rounded-full bg-slate-100 p-1 text-xs font-semibold dark:bg-white/10">
        <button
          type="button"
          onClick={() => setPanel("start")}
          className={`rounded-full px-3 py-2 ${
            panel === "start"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 dark:text-slate-300"
          }`}
        >
          Day
        </button>
        <button
          type="button"
          onClick={() => setPanel("trade")}
          disabled={!hasJournalToday}
          className={`rounded-full px-3 py-2 disabled:opacity-40 ${
            panel === "trade"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 dark:text-slate-300"
          }`}
        >
          Trade
        </button>
        <button
          type="button"
          onClick={() => setPanel("account")}
          className={`rounded-full px-3 py-2 ${
            panel === "account"
              ? "bg-slate-950 text-white dark:bg-white dark:text-slate-950"
              : "text-slate-600 dark:text-slate-300"
          }`}
        >
          Account
        </button>
      </div>

      {(journalError || accountError || successMessage) && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-2xl px-3 py-2 text-sm ${
            successMessage
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
          }`}
        >
          <CircleAlert className="mt-0.5 shrink-0" size={16} />
          <span>{successMessage || journalError || accountError}</span>
        </div>
      )}

      {panel === "start" && (
        <form className="mt-5 space-y-4" onSubmit={handleStartDay}>
          <div data-journal-body className="space-y-4">
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

          {selectedAccount && (
            <div className="grid grid-cols-3 gap-2 border-y border-slate-200 py-3 text-sm dark:border-white/10">
              <span>
                <strong className="block text-slate-950 dark:text-white">
                  {selectedAccount.currency} {selectedAccount.currentBalance.toLocaleString()}
                </strong>
                <small className="text-slate-500 dark:text-slate-400">Balance</small>
              </span>
              <span>
                <strong className="block text-slate-950 dark:text-white">
                  {selectedAccount.accountType}
                </strong>
                <small className="text-slate-500 dark:text-slate-400">Type</small>
              </span>
              <span>
                <strong className="block text-slate-950 dark:text-white">
                  {selectedAccount.leverage}
                </strong>
                <small className="text-slate-500 dark:text-slate-400">Leverage</small>
              </span>
            </div>
          )}

          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Before trading
            <textarea
              className="mt-2 min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              value={beforeTrading}
              onChange={(event) => setBeforeTrading(event.target.value)}
              placeholder="Bias, mood, risks, focus for today"
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
            disabled={isJournalLoading || isLoadingAccounts}
          >
            <ArrowRight size={18} />
            {isJournalLoading ? "Starting..." : hasJournalToday ? "Refresh journal" : "Start My Day"}
          </Button>
          </div>
        </form>
      )}

      {panel === "trade" && (
        <form className="mt-5 space-y-4" onSubmit={handleCreateTrade}>
          <div data-journal-body className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              placeholder="Symbol"
              value={tradeForm.symbol}
              onChange={(event) => updateTradeForm("symbol", event.target.value)}
              required
            />
            <select
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              value={tradeForm.instrument}
              onChange={(event) => updateTradeForm("instrument", event.target.value)}
            >
              {["forex", "indices", "crypto", "stocks", "commodities", "others"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <select
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              value={tradeForm.direction}
              onChange={(event) => updateTradeForm("direction", event.target.value)}
            >
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
            <select
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              value={tradeForm.session}
              onChange={(event) => updateTradeForm("session", event.target.value)}
            >
              {["Asian", "Tokyo", "London", "New York"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["entryPrice", "Entry"],
              ["stopLoss", "Stop"],
              ["takeProfit", "Target"],
              ["lotSize", "Size"],
              ["riskPercentage", "Risk %"],
              ["plannedRR", "RR"],
            ].map(([key, label]) => (
              <input
                key={key}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                type="number"
                min="0"
                step="any"
                placeholder={label}
                value={String(tradeForm[key as keyof CreateTradePayload] || "")}
                onChange={(event) =>
                  updateTradeForm(key as keyof CreateTradePayload, event.target.value)
                }
                required
              />
            ))}
          </div>

          <textarea
            className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            placeholder="Execution notes"
            value={tradeForm.notes}
            onChange={(event) => updateTradeForm("notes", event.target.value)}
          />

          <Button className="w-full" type="submit" disabled={isJournalLoading || !hasJournalToday}>
            <Plus size={18} />
            {isJournalLoading ? "Saving..." : "Add Trade"}
          </Button>
          </div>
        </form>
      )}

      {panel === "account" && (
        <form className="mt-5 space-y-4" onSubmit={handleCreateAccount}>
          <div data-journal-body className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-sm font-semibold text-slate-700 dark:border-white/10 dark:text-slate-200">
            <WalletCards size={17} />
            Trading account
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              placeholder="Account name"
              value={accountForm.accountName}
              onChange={(event) => updateAccountForm("accountName", event.target.value)}
              required
            />
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              placeholder="Account number"
              value={accountForm.accountNumber}
              onChange={(event) => updateAccountForm("accountNumber", event.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              value={accountForm.accountType}
              onChange={(event) => updateAccountForm("accountType", event.target.value)}
            >
              {["demo", "live", "prop", "challenge"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              placeholder="Broker"
              value={accountForm.broker}
              onChange={(event) => updateAccountForm("broker", event.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              placeholder="Platform"
              value={accountForm.platform}
              onChange={(event) => updateAccountForm("platform", event.target.value)}
              required
            />
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              placeholder="Leverage"
              value={accountForm.leverage}
              onChange={(event) => updateAccountForm("leverage", event.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              type="number"
              min="0"
              placeholder="Balance"
              value={accountForm.initialBalance || ""}
              onChange={(event) => updateAccountForm("initialBalance", event.target.value)}
              required
            />
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              placeholder="Currency"
              value={accountForm.currency}
              onChange={(event) => updateAccountForm("currency", event.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              type="number"
              min="0"
              placeholder="Max drawdown %"
              value={accountForm.maxDrawnDown || ""}
              onChange={(event) => updateAccountForm("maxDrawnDown", event.target.value)}
            />
            <input
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              type="number"
              min="0"
              placeholder="Profit target %"
              value={accountForm.profitTarget || ""}
              onChange={(event) => updateAccountForm("profitTarget", event.target.value)}
            />
          </div>
          <Button className="w-full" type="submit" disabled={isCreatingAccount}>
            <Plus size={18} />
            {isCreatingAccount ? "Creating..." : "Create Account"}
          </Button>
          </div>
        </form>
      )}

      <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        {hasJournalToday
          ? `${journal?.tradesCount || 0} trade${journal?.tradesCount === 1 ? "" : "s"} logged today.`
          : accounts.length
            ? "Select an account and start today's journal."
            : "Create a trading account to begin."}
      </div>
    </section>
  );
}
