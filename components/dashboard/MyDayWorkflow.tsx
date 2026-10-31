"use client";

import Button from "@/components/ui/Button";
import NoTradeDayModal from "@/components/dashboard/NoTradeDayModal";
import VoiceNoteTextarea from "@/components/journal/VoiceNoteTextarea";
import {
  animateJournalSequence,
  animateJournalStateChange,
} from "@/animations/journal";
import {
  getAccountStatusLabel,
  getSelectedAccount,
  getTradableAccounts,
  isAccountInPlay,
  needsNewAccount,
} from "@/lib/account";
import { getApiErrorMessage } from "@/lib/axios";
import { useAccountsStore } from "@/stores/accounts.store";
import { useJournalStore } from "@/stores/journal.store";
import TradeSetupCalculator from "@/components/journal/TradeSetupCalculator";
import { CreateTradePayload } from "@/types/journal.types";
import { CreateTradingAccountPayload } from "@/types/trading-account.types";
import {
  getBeforeTradingAudioService,
  uploadBeforeTradingAudioService,
} from "@/services/journal.service";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Coffee,
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
  maxDrawnDown: 10,
  profitTarget: 10,
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
  targetMode: "rr",
  sizingMode: "auto",
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
  const accounts = useAccountsStore((state) => state.accounts);
  const storeSelectedAccountId = useAccountsStore(
    (state) => state.selectedAccountId,
  );
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const createAccount = useAccountsStore((state) => state.createAccount);
  const selectAccount = useAccountsStore((state) => state.selectAccount);

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
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const [isNoTradeOpen, setIsNoTradeOpen] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [savedAudioUrl, setSavedAudioUrl] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioPreviewUrlRef = useRef<string | null>(null);

  const journal = journalStatus?.journal;
  const hasJournalToday = Boolean(journalStatus?.hasJournalToday && journal);
  const journalPrompts = hasJournalToday
    ? [
        "Welcome back.",
        "You've already started your day.",
        "Continue your journal.",
      ]
    : [
        "Good morning.",
        "Let's prepare for today's trading.",
        "How are you feeling today?",
        "What is your market bias?",
        "What are you watching?",
        "What is your risk today?",
      ];

  const selectedAccount = useMemo(
    () =>
      accounts.find((account) => account._id === selectedAccountId) ||
      getSelectedAccount(accounts, storeSelectedAccountId),
    [accounts, selectedAccountId, storeSelectedAccountId],
  );
  const tradableAccounts = useMemo(
    () => getTradableAccounts(accounts),
    [accounts],
  );
  const mustCreateAccount = needsNewAccount(accounts);
  const canTradeOnSelected = isAccountInPlay(selectedAccount);

  useEffect(() => {
    if (!audioBlob) {
      setAudioPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(audioBlob);
    audioPreviewUrlRef.current = url;
    setAudioPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
      if (audioPreviewUrlRef.current === url) {
        audioPreviewUrlRef.current = null;
      }
    };
  }, [audioBlob]);

  const saveVoiceNote = async (journalId: string): Promise<boolean> => {
    if (!audioBlob) return true;

    setIsUploadingAudio(true);
    setAudioError(null);

    try {
      await uploadBeforeTradingAudioService(
        journalId,
        audioBlob,
        beforeTrading,
      );

      const playback = await getBeforeTradingAudioService(journalId);
      setSavedAudioUrl(playback.data.playbackUrl);

      return true;
    } catch {
      setAudioError(
        "Your journal text was saved, but the voice note could not be uploaded. Your recording is still available to retry.",
      );
      return false;
    } finally {
      setIsUploadingAudio(false);
    }
  };

  useEffect(() => {
    const journalId = hasJournalToday ? journal?._id : undefined;

    if (!journalId) {
      setSavedAudioUrl(null);
      return;
    }

    let cancelled = false;

    getBeforeTradingAudioService(journalId)
      .then((response) => {
        if (!cancelled) {
          setSavedAudioUrl(response.data.playbackUrl);
        }
      })
      .catch(() => {
        // A journal without a recording is normal.
        if (!cancelled) setSavedAudioUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [hasJournalToday, journal?._id]);

  useEffect(() => {
    const loadWorkflow = async () => {
      setIsLoadingAccounts(true);
      setAccountError(null);

      try {
        const loadedAccounts = await fetchAccounts();
        const preferred = getSelectedAccount(
          loadedAccounts,
          storeSelectedAccountId,
        );
        const nextAccountId = preferred?._id || "";
        setSelectedAccountId(nextAccountId);
        const statusResponse = await getTodayJournalStatus();
        const hasToday = Boolean(statusResponse.data.hasJournalToday);

        if (!loadedAccounts.length) {
          setPanel("account");
        } else if (!isAccountInPlay(preferred)) {
          setAccountError(
            `${preferred?.accountName || "This account"} has ${
              getAccountStatusLabel(preferred) === "Passed"
                ? "passed"
                : "been breached"
            }. Create a new account before taking another trade. Today's journal stays open.`,
          );
          setPanel(hasToday ? "trade" : "account");
        } else if (initialPanel === "trade" && !hasToday) {
          setPanel("start");
        } else {
          setPanel(initialPanel);
        }
      } catch (error) {
        void error;
        setAccountError("Unable to load trading accounts.");
      } finally {
        setIsLoadingAccounts(false);
      }
    };

    loadWorkflow();
  }, [
    fetchAccounts,
    getTodayJournalStatus,
    initialPanel,
    storeSelectedAccountId,
  ]);

  useEffect(() => {
    const handleOpenMyDay = (event: Event) => {
      const nextHasJournalToday =
        event instanceof CustomEvent &&
        typeof event.detail?.hasJournalToday === "boolean"
          ? event.detail.hasJournalToday
          : hasJournalToday;

      if (nextHasJournalToday) {
        setPanel("trade");
        if (!canTradeOnSelected) {
          setAccountError(
            "Create a new account before taking another trade. Today's journal stays open.",
          );
        }
        return;
      }
      setPanel(mustCreateAccount ? "account" : "start");
    };

    window.addEventListener("juvo:open-my-day", handleOpenMyDay);

    return () => {
      window.removeEventListener("juvo:open-my-day", handleOpenMyDay);
    };
  }, [canTradeOnSelected, hasJournalToday, mustCreateAccount]);

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
      const account = await createAccount(accountForm);
      setSelectedAccountId(account._id);
      setAccountForm(defaultAccountForm);
      const status = await getTodayJournalStatus();
      setPanel(status.data.hasJournalToday ? "trade" : "start");
      setSuccessMessage(
        status.data.hasJournalToday
          ? "New account ready. Today's journal stays open — keep logging trades."
          : "Trading account created. You can start today's journal.",
      );
      onJournalUpdated?.();
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
    setAudioError(null);

    if (voiceBusy) {
      setAudioError("Finish speaking or wait for transcription before continuing.");
      return;
    }

    if (hasJournalToday) {
      if (audioBlob && journal?._id) {
        const uploaded = await saveVoiceNote(journal._id);

        setSuccessMessage(
          uploaded
            ? "Your voice note and transcript have been saved."
            : "Your journal is open, but your voice note still needs uploading.",
        );
      }

      setPanel(canTradeOnSelected ? "trade" : "account");

      if (!canTradeOnSelected) {
        setAccountError(
          "Create a new account before taking another trade. Today's journal stays open.",
        );
      }

      onJournalUpdated?.();
      return;
    }

    if (!selectedAccountId || !canTradeOnSelected) {
      setAccountError(
        mustCreateAccount
          ? "Create a trading account before starting your day."
          : "This account can no longer take trades. Create a new account first.",
      );
      setPanel("account");
      return;
    }

    try {
      await selectAccount(selectedAccountId);

      const response = await createJournal({
        tradingAccount: selectedAccountId,
        beforeTrading,
        confidenceBefore,
      });

      const createdJournalId = response.data.journal?._id;

      let uploaded = true;

      if (audioBlob && createdJournalId) {
        uploaded = await saveVoiceNote(createdJournalId);
      }

      setSuccessMessage(
        uploaded
          ? "Your day journal is ready."
          : "Your day journal is ready, but the voice note still needs uploading.",
      );

      setPanel("trade");
      onJournalUpdated?.();
    } catch (error) {
      setAccountError(
        getApiErrorMessage(error, "Unable to start today's journal."),
      );
    }
  };

  const handleCreateTrade = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage(null);

    if (!journal?._id) return;

    if (!selectedAccountId || !canTradeOnSelected) {
      setAccountError(
        mustCreateAccount
          ? "Create a trading account before logging a trade."
          : "This account has passed or been breached. Create a new account before taking another trade.",
      );
      setPanel("account");
      return;
    }

    try {
      const payload = {
        ...tradeForm,
        tradingAccount: selectedAccountId,
        sizingMode:
          tradeForm.sizingMode === "manual" || Number(tradeForm.lotSize) > 0
            ? tradeForm.sizingMode || "auto"
            : "auto",
      };

      if (!(Number(payload.lotSize) > 0) && payload.sizingMode === "manual") {
        setAccountError("Enter a position size before saving the trade.");
        return;
      }

      await createTrade(journal._id, payload);
      setTradeForm(defaultTradeForm);
      setSuccessMessage("Trade added to today's journal.");
      onJournalUpdated?.();
    } catch (error) {
      setAccountError(
        getApiErrorMessage(
          error,
          "Unable to create this trade. Check entry, stop, risk, and size, then try again.",
        ),
      );
    }
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
          {hasJournalToday ? (
            <CheckCircle2 size={21} />
          ) : (
            <NotebookPen size={21} />
          )}
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
          onClick={() => {
            if (!canTradeOnSelected) {
              setPanel("account");
              setAccountError(
                mustCreateAccount
                  ? "Create a trading account before logging a trade."
                  : "This account has passed or been breached. Create a new account before taking another trade.",
              );
              return;
            }
            setPanel("trade");
          }}
          disabled={!hasJournalToday || !canTradeOnSelected}
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
                onChange={(event) => {
                  const accountId = event.target.value;
                  setSelectedAccountId(accountId);
                  if (accountId)
                    selectAccount(accountId).catch(() => undefined);
                }}
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
                      {inPlay ? "" : ` · ${getAccountStatusLabel(account)}`}
                    </option>
                  );
                })}
              </select>
            </label>

            {selectedAccount && (
              <div className="grid grid-cols-3 gap-2 border-y border-slate-200 py-3 text-sm dark:border-white/10">
                <span>
                  <strong className="block text-slate-950 dark:text-white">
                    {selectedAccount.accountCurrency ||
                      selectedAccount.currency}{" "}
                    {selectedAccount.currentBalance.toLocaleString()}
                  </strong>
                  <small className="text-slate-500 dark:text-slate-400">
                    Balance
                  </small>
                </span>
                <span>
                  <strong className="block text-slate-950 dark:text-white">
                    {selectedAccount.status || "Active"}
                  </strong>
                  <small className="text-slate-500 dark:text-slate-400">
                    {selectedAccount.isActive ? "Active account" : "Status"}
                  </small>
                </span>
                <span>
                  <strong className="block text-slate-950 dark:text-white">
                    {selectedAccount.leverage}
                  </strong>
                  <small className="text-slate-500 dark:text-slate-400">
                    Leverage
                  </small>
                </span>
              </div>
            )}

            <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-950 dark:text-white">
                    Staying out today?
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    Record a no-trade day in a few seconds. It keeps your
                    journaling streak without creating a fake trade.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 shrink-0"
                  onClick={() => setIsNoTradeOpen(true)}
                >
                  <Coffee size={16} />
                  No Trade Today
                </Button>
              </div>
            </div>

            <VoiceNoteTextarea
              label="Before trading"
              value={beforeTrading}
              onChange={setBeforeTrading}
              placeholder="Bias, mood, risks, focus for today"
              helperText="Speak your prep note. JUVO transcribes it into this box and can save the recording with your journal."
              captureAudio
              onAudioChange={(blob) => {
                setAudioError(null);
                setAudioBlob(blob);
                if (blob) setSavedAudioUrl(null);
              }}
              onBusyChange={setVoiceBusy}
              disabled={isUploadingAudio}
            />

            <div className="space-y-3">
              {audioBlob ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-300">
                  Voice note ready to upload with your journal.
                </p>
              ) : null}

              {audioError ? (
                <p
                  className="text-xs text-rose-600 dark:text-rose-300"
                  role="alert"
                >
                  {audioError}
                </p>
              ) : null}

              {(audioPreviewUrl || savedAudioUrl) && (
                <audio
                  key={audioPreviewUrl || savedAudioUrl}
                  controls
                  preload="none"
                  className="w-full"
                  src={audioPreviewUrl || savedAudioUrl || undefined}
                />
              )}
            </div>

            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Confidence: {confidenceBefore}/10
              <input
                className="mt-2 w-full accent-cyan-400"
                type="range"
                min="1"
                max="10"
                value={confidenceBefore}
                onChange={(event) =>
                  setConfidenceBefore(Number(event.target.value))
                }
              />
            </label>

            {mustCreateAccount ? (
              <Button
                className="w-full"
                type="button"
                onClick={() => setPanel("account")}
              >
                <WalletCards size={18} />
                Create an account first
              </Button>
            ) : (
              <Button
                className="w-full"
                type="submit"
                disabled={
                  isJournalLoading ||
                  isLoadingAccounts ||
                  !canTradeOnSelected ||
                  voiceBusy ||
                  isUploadingAudio
                }
              >
                <ArrowRight size={18} />
                {isUploadingAudio
                  ? "Uploading voice note..."
                  : isJournalLoading
                    ? "Starting..."
                    : hasJournalToday
                      ? "Refresh journal"
                      : "Start My Day"}
              </Button>
            )}
          </div>
        </form>
      )}

      {panel === "trade" && !canTradeOnSelected ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
          <p>
            {mustCreateAccount
              ? "You need a trading account before you can log a trade."
              : "This account has passed or been breached. Create a new account before taking another trade. Today's journal stays open and will keep recording every trade."}
          </p>
          <Button
            className="mt-4 w-full"
            type="button"
            onClick={() => setPanel("account")}
          >
            <WalletCards size={18} />
            Create new account
          </Button>
        </div>
      ) : null}

      {panel === "trade" &&
      canTradeOnSelected &&
      journalStatus?.noTradeDay?.isActive ? (
        <div className="mt-5 space-y-3 rounded-2xl border border-orange-200/80 bg-orange-50/80 p-4 text-sm text-orange-900 dark:border-orange-400/20 dark:bg-orange-400/10 dark:text-orange-100">
          <p className="font-semibold">No-trade day is active</p>
          <p>
            Trade logging is locked for today. Lift the lock if market
            conditions now align with your plan.
          </p>
          <Button
            type="button"
            className="w-full"
            onClick={() => setIsNoTradeOpen(true)}
          >
            <Coffee size={16} />
            Manage no-trade day
          </Button>
        </div>
      ) : null}

      {panel === "trade" &&
      canTradeOnSelected &&
      !journalStatus?.noTradeDay?.isActive && (
        <form className="mt-5 space-y-4" onSubmit={handleCreateTrade}>
          <div data-journal-body className="space-y-4">
            <TradeSetupCalculator
              value={tradeForm}
              onChange={setTradeForm}
              tradingAccountId={selectedAccountId}
              accountCurrency={
                selectedAccount?.accountCurrency ||
                selectedAccount?.currency ||
                "USD"
              }
              disabled={isJournalLoading}
            />

            <VoiceNoteTextarea
              label="Execution notes"
              value={tradeForm.notes || ""}
              onChange={(next) => updateTradeForm("notes", next)}
              placeholder="What you saw, why you entered, how you managed it"
              helperText="Dictate the story of the trade instead of typing it all out."
              className="min-h-0"
              textareaClassNameOverride="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
            />

            <Button
              className="w-full"
              type="submit"
              disabled={isJournalLoading || !hasJournalToday}
            >
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
              {mustCreateAccount
                ? "Create a trading account"
                : "Trading account"}
            </div>
            {accounts.length && !tradableAccounts.length ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your last account has passed or been breached. Create a new one
                before taking another trade.
              </p>
            ) : null}
            <div className="grid grid-cols-2 gap-3">
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                placeholder="Account name"
                value={accountForm.accountName}
                onChange={(event) =>
                  updateAccountForm("accountName", event.target.value)
                }
                required
              />
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                placeholder="Account number"
                value={accountForm.accountNumber}
                onChange={(event) =>
                  updateAccountForm("accountNumber", event.target.value)
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                value={accountForm.accountType}
                onChange={(event) =>
                  updateAccountForm("accountType", event.target.value)
                }
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
                onChange={(event) =>
                  updateAccountForm("broker", event.target.value)
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                placeholder="Platform"
                value={accountForm.platform}
                onChange={(event) =>
                  updateAccountForm("platform", event.target.value)
                }
                required
              />
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                placeholder="Leverage"
                value={accountForm.leverage}
                onChange={(event) =>
                  updateAccountForm("leverage", event.target.value)
                }
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
                onChange={(event) =>
                  updateAccountForm("initialBalance", event.target.value)
                }
                required
              />
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                placeholder="Currency"
                value={accountForm.currency}
                onChange={(event) =>
                  updateAccountForm("currency", event.target.value)
                }
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
                onChange={(event) =>
                  updateAccountForm("maxDrawnDown", event.target.value)
                }
              />
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                type="number"
                min="0"
                placeholder="Profit target %"
                value={accountForm.profitTarget || ""}
                onChange={(event) =>
                  updateAccountForm("profitTarget", event.target.value)
                }
              />
            </div>
            <Button
              className="w-full"
              type="submit"
              disabled={isCreatingAccount}
            >
              <Plus size={18} />
              {isCreatingAccount ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      )}

      {hasJournalToday && panel === "trade" ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setIsNoTradeOpen(true)}
          >
            <Coffee size={16} />
            {journalStatus?.noTradeDay?.isActive
              ? "Manage no-trade lock"
              : journalStatus?.noTradeDay
                ? "View / re-lock no-trade day"
                : "No Trade Today"}
          </Button>
        </div>
      ) : null}

      <div className="mt-5 border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        {journalStatus?.noTradeDay?.isActive
          ? "No-trade day active — trades locked."
          : journalStatus?.journalingStatus === "no_trade_day"
            ? "No-trade day logged ✓"
            : hasJournalToday
              ? `${journal?.tradesCount || 0} trade${journal?.tradesCount === 1 ? "" : "s"} logged today.`
              : accounts.length
                ? "Select an account and start today's journal."
                : "Create a trading account to begin."}
      </div>

      <NoTradeDayModal
        isOpen={isNoTradeOpen}
        onClose={() => setIsNoTradeOpen(false)}
        tradingAccountId={selectedAccountId || null}
        onSaved={() => {
          setSuccessMessage(
            "No-trade day recorded. Your journaling streak is up to date.",
          );
          getTodayJournalStatus().catch(() => undefined);
          onJournalUpdated?.();
        }}
      />
    </section>
  );
}
