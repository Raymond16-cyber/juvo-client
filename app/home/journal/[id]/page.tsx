"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import PlanComplianceCard from "@/components/journal/PlanComplianceCard";
import SmartJournalInterviewer from "@/components/journal/SmartJournalInterviewer";
import TradeScreenshotReview, {
  ScreenshotReviewDisplay,
} from "@/components/journal/TradeScreenshotReview";
import VoiceNoteTextarea from "@/components/journal/VoiceNoteTextarea";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getJournalDisplayPnl, getRecordCurrency } from "@/lib/account";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate, formatMoney, pnlClass } from "@/lib/format";
import { controlClassName, textareaClassName } from "@/lib/ui";
import {
  analyzeTradeScreenshotService,
} from "@/services/journal.service";
import { getAiAccessService } from "@/services/ai.service";
import { useJournalStore } from "@/stores/journal.store";
import { AiAccess } from "@/types/ai.types";
import { CompleteJournalPayload } from "@/types/journal.types";
import { ArrowLeft, Bot, CheckCircle2, NotebookPen } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

const defaultReview: CompleteJournalPayload = {
  afterTrading: "",
  confidenceAfter: 7,
  biggestMistake: "",
  biggestWin: "",
  lessonLearned: "",
  improvementsTomorrow: "",
  overallThoughts: "",
  followedTradingPlan: true,
  followedRiskManagement: true,
  revengeTraded: false,
  overTraded: false,
  respectedStopLoss: true,
};

function estimateCloseResult({
  accountBalance,
  direction,
  entryPrice,
  exitPrice,
  riskPercentage,
  status,
  stopLoss,
}: {
  accountBalance: number;
  direction?: "long" | "short";
  entryPrice?: number;
  exitPrice: number;
  riskPercentage?: number;
  status: "Closed" | "Breakeven" | "Cancelled";
  stopLoss?: number;
}) {
  if (status === "Breakeven" || status === "Cancelled") {
    return { achievedRR: 0, profitLoss: 0 };
  }

  const entry = Number(entryPrice || 0);
  const stop = Number(stopLoss || 0);
  const risk = Math.abs(entry - stop);

  if (!entry || !stop || !risk || !exitPrice) {
    return null;
  }

  const move = direction === "short" ? entry - exitPrice : exitPrice - entry;
  const achievedRR = Number((move / risk).toFixed(2));
  const riskAmount = accountBalance
    ? accountBalance * (Number(riskPercentage || 0) / 100)
    : 0;
  const profitLoss = Number(
    (achievedRR * (riskAmount || Math.abs(move))).toFixed(2),
  );

  return { achievedRR, profitLoss };
}

export default function JournalDetailPage() {
  const params = useParams<{ id: string }>();
  const journalId = params.id;
  const journal = useJournalStore((state) => state.currentJournal);
  const isLoading = useJournalStore((state) => state.isLoading);
  const error = useJournalStore((state) => state.error);
  const getJournalById = useJournalStore((state) => state.getJournalById);
  const closeTrade = useJournalStore((state) => state.closeTrade);
  const completeJournal = useJournalStore((state) => state.completeJournal);

  const [review, setReview] = useState(defaultReview);
  const [closingTradeId, setClosingTradeId] = useState<string | null>(null);
  const [exitPrice, setExitPrice] = useState("");
  const [closeStatus, setCloseStatus] = useState<
    "Closed" | "Breakeven" | "Cancelled"
  >("Closed");
  const [message, setMessage] = useState<string | null>(null);
  const messageTimerRef = useRef<number | null>(null);

  const showPageMessage = (next: string | null) => {
    if (messageTimerRef.current !== null) {
      window.clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
    setMessage(next);
    if (next) {
      messageTimerRef.current = window.setTimeout(() => {
        setMessage(null);
        messageTimerRef.current = null;
      }, 4000);
    }
  };
  const [aiAccess, setAiAccess] = useState<AiAccess | null>(null);
  const [aiAccessLoading, setAiAccessLoading] = useState(true);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [analyzingScreenshot, setAnalyzingScreenshot] = useState(false);
  const [screenshotError, setScreenshotError] = useState<string | null>(null);
  const [followUpTradeId, setFollowUpTradeId] = useState<string | null>(null);
  const [followUpFile, setFollowUpFile] = useState<File | null>(null);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [followUpAnalyzing, setFollowUpAnalyzing] = useState(false);
  const [expandedReviewTradeId, setExpandedReviewTradeId] = useState<
    string | null
  >(null);
  const closingInFlight = useRef(false);

  useEffect(() => {
    if (!journalId) return;
    getJournalById(journalId).catch(() => undefined);
  }, [getJournalById, journalId]);

  useEffect(() => {
    let cancelled = false;
    setAiAccessLoading(true);
    getAiAccessService()
      .then((response) => {
        if (!cancelled) setAiAccess(response.data);
      })
      .catch(() => {
        if (!cancelled) setAiAccess(null);
      })
      .finally(() => {
        if (!cancelled) setAiAccessLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!journal) return;
    queueMicrotask(() => {
      setReview({
        afterTrading: journal.psychology?.afterTrading || "",
        confidenceAfter: journal.psychology?.confidenceAfter || 7,
        biggestMistake: journal.review?.biggestMistake || "",
        biggestWin: journal.review?.biggestWin || "",
        lessonLearned: journal.review?.lessonLearned || "",
        improvementsTomorrow: journal.review?.improvementsTomorrow || "",
        overallThoughts: journal.review?.overallThoughts || "",
        followedTradingPlan: journal.discipline?.followedTradingPlan ?? true,
        followedRiskManagement:
          journal.discipline?.followedRiskManagement ?? true,
        revengeTraded: journal.discipline?.revengeTraded ?? false,
        overTraded: journal.discipline?.overTraded ?? false,
        respectedStopLoss: journal.discipline?.respectedStopLoss ?? true,
      });
    });
  }, [journal]);

  const accountName =
    journal?.tradingAccount && typeof journal.tradingAccount !== "string"
      ? `${journal.tradingAccount.accountName} · ${journal.tradingAccount.broker}`
      : "Trading account";
  const accountStatus =
    journal?.tradingAccount && typeof journal.tradingAccount !== "string"
      ? journal.tradingAccount.status
      : undefined;
  const journalCurrency = getRecordCurrency(journal);
  const journalDisplay = journal
    ? getJournalDisplayPnl(journal, journalCurrency)
    : { value: 0, currency: journalCurrency, conversionUnavailable: false };
  const journalDisplayProfitLoss = journalDisplay.value;
  const journalDisplayCurrency = journalDisplay.currency;
  const closingTrade = journal?.trades?.find(
    (trade) => trade._id === closingTradeId,
  );
  const accountBalance =
    journal?.tradingAccount && typeof journal.tradingAccount !== "string"
      ? journal.tradingAccount.currentBalance
      : 0;
  const estimatedClose = closingTrade
    ? estimateCloseResult({
        accountBalance,
        direction: closingTrade.direction,
        entryPrice: closingTrade.entryPrice,
        exitPrice: Number(exitPrice || 0),
        riskPercentage: closingTrade.riskPercentage,
        status: closeStatus,
        stopLoss: closingTrade.stopLoss,
      })
    : null;

  const resetCloseForm = () => {
    setClosingTradeId(null);
    setExitPrice("");
    setCloseStatus("Closed");
    setScreenshotFile(null);
    setScreenshotError(null);
    setAnalyzingScreenshot(false);
  };

  const handleCloseTrade = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!journal || !closingTradeId || closingInFlight.current) return;
    closingInFlight.current = true;
    setScreenshotError(null);

    try {
      const tradeId = closingTradeId;
      const response = await closeTrade(journal._id, tradeId, {
        exitPrice: Number(exitPrice),
        status: closeStatus,
      });

      const accountStatus = response.tradingAccount?.status;
      let closeMessage =
        accountStatus === "Passed"
          ? "Trade closed. This trading account has passed its profit target."
          : accountStatus === "Breached"
            ? "Trade closed. This trading account has been breached."
            : response.message || "Trade closed.";

      if (screenshotFile && aiAccess?.hasAccess) {
        setAnalyzingScreenshot(true);
        try {
          await analyzeTradeScreenshotService(
            journal._id,
            tradeId,
            screenshotFile,
          );
          setExpandedReviewTradeId(tradeId);
          closeMessage = `${closeMessage} Screenshot review saved.`;
        } catch (error) {
          const reviewError = getApiErrorMessage(
            error,
            "Trade saved. Screenshot review failed.",
          );
          setScreenshotError(reviewError);
          closeMessage = `${closeMessage} Screenshot review failed.`;
        } finally {
          setAnalyzingScreenshot(false);
        }
      }

      showPageMessage(closeMessage);
      resetCloseForm();
      await getJournalById(journal._id);
    } catch {
      // closeTrade already stores the error in the journal store.
    } finally {
      closingInFlight.current = false;
    }
  };

  const handleFollowUpReview = async (tradeId: string) => {
    if (!journal || !followUpFile || followUpAnalyzing) return;
    setFollowUpAnalyzing(true);
    setFollowUpError(null);
    try {
      await analyzeTradeScreenshotService(journal._id, tradeId, followUpFile);
      setFollowUpTradeId(null);
      setFollowUpFile(null);
      setExpandedReviewTradeId(tradeId);
      showPageMessage("Screenshot review saved.");
      await getJournalById(journal._id);
    } catch (error) {
      setFollowUpError(
        getApiErrorMessage(error, "Unable to analyze this screenshot."),
      );
    } finally {
      setFollowUpAnalyzing(false);
    }
  };

  const handleComplete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!journal) return;
    await completeJournal(journal._id, review);
    showPageMessage("Day reviewed. Juvo saved the process notes.");
  };

  useEffect(() => {
    return () => {
      if (messageTimerRef.current !== null) {
        window.clearTimeout(messageTimerRef.current);
      }
    };
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Journal"
          title={journal ? formatDate(journal.journalDate) : "Session review"}
          description={
            journal
              ? `${accountName}${accountStatus ? ` · ${accountStatus}` : ""} · ${journal.status} · ${journal.tradesCount || 0} trades`
              : "Open a session to review psychology, execution, and Juvo feedback."
          }
          actions={
            <Link href="/home/journal">
              <Button variant="ghost">
                <ArrowLeft size={16} />
                All journals
              </Button>
            </Link>
          }
        />

        {(error || message) && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              message
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
            }`}
          >
            {message || error}
          </div>
        )}

        {!journal && isLoading ? (
          <Card>
            <EmptyState
              title="Loading session"
              body="Pulling trades and notes."
            />
          </Card>
        ) : journal ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
            <div className="min-w-0 space-y-6">
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  [
                    "P/L",
                    formatMoney(
                      journalDisplayProfitLoss,
                      journalDisplayCurrency,
                    ),
                    pnlClass(journalDisplayProfitLoss),
                  ],
                  ["Open", String(journal.openTrades || 0), ""],
                  ["Closed", String(journal.closedTrades || 0), ""],
                  ["Discipline", `${journal.discipline?.score ?? "—"}`, ""],
                ].map(([label, value, tone]) => (
                  <Card key={label} className="min-w-0 p-3 sm:p-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                    <p
                      className={`mt-2 break-words text-xl font-bold sm:text-2xl ${tone || "text-slate-950 dark:text-white"}`}
                    >
                      {value}
                    </p>
                  </Card>
                ))}
              </div>

              <Card className="p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <NotebookPen size={18} className="shrink-0 text-primary" />
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Pre-market note
                  </h2>
                </div>
                <p className="juvo-break-words mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {journal.psychology?.beforeTrading ||
                    "No pre-market note was captured."}
                </p>
                {journal.psychology?.confidenceBefore ? (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Confidence before: {journal.psychology.confidenceBefore}/10
                  </p>
                ) : null}
              </Card>

              <Card className="divide-y divide-slate-200 dark:divide-white/10">
                <div className="p-5">
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Trades
                  </h2>
                </div>
                {journal.trades?.length ? (
                  journal.trades.map((trade) => (
                    <article key={trade._id} className="min-w-0 p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="break-words text-base font-bold text-slate-950 dark:text-white">
                            {trade.symbol} · {trade.direction}
                          </p>
                          <p className="juvo-break-words mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {trade.instrument} · {trade.session || "No session"}{" "}
                            · {trade.status}
                            {trade.tradingAccount &&
                            typeof trade.tradingAccount !== "string"
                              ? ` · ${trade.tradingAccount.accountName}`
                              : ""}
                          </p>
                          <p className="juvo-break-words mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Entry {trade.entryPrice} · SL{" "}
                            {trade.stopLoss ?? "N/A"} · TP{" "}
                            {trade.takeProfit ?? "N/A"} · Size {trade.lotSize}
                          </p>
                          {trade.notes ? (
                            <p className="juvo-break-words mt-2 text-sm text-slate-500 dark:text-slate-400">
                              {trade.notes}
                            </p>
                          ) : null}
                        </div>
                        <div className="shrink-0 text-left sm:text-right">
                          <p
                            className={`break-words text-lg font-bold ${pnlClass(trade.profitLoss || 0)}`}
                          >
                            {formatMoney(
                              trade.profitLoss || 0,
                              trade.profitLossCurrency ||
                                getRecordCurrency(trade, journalCurrency),
                            )}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            RR {trade.achievedRR ?? trade.plannedRR ?? "N/A"}
                          </p>
                          {trade.status === "Open" &&
                          (!trade.source || trade.source === "manual") ? (
                            <Button
                              variant="ghost"
                              className="mt-3 h-11 px-3"
                              onClick={() => {
                                setClosingTradeId(trade._id);
                                setExitPrice(String(trade.takeProfit || ""));
                                setScreenshotFile(null);
                                setScreenshotError(null);
                              }}
                            >
                              Close trade
                            </Button>
                          ) : null}
                          {trade.status !== "Open" &&
                          !trade.screenshotAnalysis &&
                          followUpTradeId !== trade._id ? (
                            <Button
                              variant="ghost"
                              className="mt-3 h-11 px-3"
                              onClick={() => {
                                setFollowUpTradeId(trade._id);
                                setFollowUpFile(null);
                                setFollowUpError(null);
                              }}
                            >
                              Add chart review
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      {trade.screenshotAnalysis ? (
                        <ScreenshotReviewDisplay
                          key={`${trade._id}-${expandedReviewTradeId === trade._id ? "open" : "closed"}`}
                          analysis={trade.screenshotAnalysis}
                          defaultOpen={expandedReviewTradeId === trade._id}
                        />
                      ) : null}
                      {followUpTradeId === trade._id ? (
                        <div className="mt-4 space-y-3">
                          <TradeScreenshotReview
                            access={aiAccess}
                            accessLoading={aiAccessLoading}
                            selectedFile={followUpFile}
                            onFileChange={setFollowUpFile}
                            analyzing={followUpAnalyzing}
                            error={followUpError}
                            mode="picker"
                            onRequestReview={() =>
                              handleFollowUpReview(trade._id)
                            }
                            requestDisabled={!followUpFile}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-9 px-3"
                            disabled={followUpAnalyzing}
                            onClick={() => {
                              setFollowUpTradeId(null);
                              setFollowUpFile(null);
                              setFollowUpError(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : null}
                    </article>
                  ))
                ) : (
                  <EmptyState
                    title="No trades in this session"
                    body="You can still complete the journal and capture the psychology of the day."
                  />
                )}
              </Card>

              {closingTradeId ? (
                <Card className="p-5">
                  <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                    Close trade
                  </h3>
                  <form className="mt-4 space-y-4" onSubmit={handleCloseTrade}>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <input
                        className={controlClassName}
                        type="number"
                        min="0"
                        step="any"
                        required
                        placeholder="Exit price"
                        value={exitPrice}
                        disabled={analyzingScreenshot}
                        onChange={(event) => setExitPrice(event.target.value)}
                      />
                      <select
                        className={controlClassName}
                        value={closeStatus}
                        disabled={analyzingScreenshot}
                        onChange={(event) =>
                          setCloseStatus(
                            event.target.value as typeof closeStatus,
                          )
                        }
                      >
                        <option value="Closed">Closed</option>
                        <option value="Breakeven">Breakeven</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <Button
                        type="submit"
                        className="w-full sm:col-span-2 lg:col-span-1"
                        disabled={isLoading || analyzingScreenshot}
                      >
                        {analyzingScreenshot
                          ? "Saving and reviewing…"
                          : isLoading
                            ? "Saving…"
                            : "Save close"}
                      </Button>
                    </div>
                    <TradeScreenshotReview
                      access={aiAccess}
                      accessLoading={aiAccessLoading}
                      selectedFile={screenshotFile}
                      onFileChange={setScreenshotFile}
                      analyzing={analyzingScreenshot}
                      error={screenshotError}
                      mode="picker"
                    />
                  </form>
                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                    {estimatedClose ? (
                      <p>
                        JUVO will calculate this close as RR{" "}
                        <span className="font-bold text-slate-950 dark:text-white">
                          {estimatedClose.achievedRR}
                        </span>{" "}
                        and{" "}
                        <span className={pnlClass(estimatedClose.profitLoss)}>
                          {formatMoney(
                            estimatedClose.profitLoss,
                            journalCurrency,
                          )}
                        </span>
                        . Broker-imported or manually supplied P/L can still
                        override this later.
                      </p>
                    ) : (
                      <p>
                        Enter an exit price and JUVO will calculate the close
                        from your entry, stop, risk, and account balance.
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-3 h-9 px-3"
                    disabled={analyzingScreenshot}
                    onClick={resetCloseForm}
                  >
                    Cancel
                  </Button>
                </Card>
              ) : null}
            </div>

            <aside className="min-w-0 space-y-6">
              <SmartJournalInterviewer journalId={journal._id} />
              <PlanComplianceCard journalId={journal._id} />

              {journal.ai?.summary || journal.ai?.feedback ? (
                <Card className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <Bot size={18} className="shrink-0" />
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                      Juvo review
                    </h2>
                  </div>
                  <p className="juvo-break-words mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {journal.ai.summary || journal.ai.feedback}
                  </p>
                  {journal.ai.feedback && journal.ai.summary ? (
                    <p className="juvo-break-words mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {journal.ai.feedback}
                    </p>
                  ) : null}
                </Card>
              ) : null}

              <Card className="p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="shrink-0 text-primary" />
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    End of day
                  </h2>
                </div>
                <form className="mt-4 space-y-4" onSubmit={handleComplete}>
                  <VoiceNoteTextarea
                    label="After trading"
                    value={review.afterTrading || ""}
                    onChange={(next) =>
                      setReview((current) => ({
                        ...current,
                        afterTrading: next,
                      }))
                    }
                    placeholder="How did the session actually feel?"
                    helperText="Speak the debrief. JUVO will write it into this box."
                  />
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Confidence after: {review.confidenceAfter}/10
                    <input
                      className="mt-2 w-full"
                      type="range"
                      min="1"
                      max="10"
                      value={review.confidenceAfter}
                      onChange={(event) =>
                        setReview((current) => ({
                          ...current,
                          confidenceAfter: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                  {[
                    ["biggestWin", "Biggest win"],
                    ["biggestMistake", "Biggest mistake"],
                    ["lessonLearned", "Lesson learned"],
                    ["improvementsTomorrow", "Improve tomorrow"],
                  ].map(([key, label]) => (
                    <VoiceNoteTextarea
                      key={key}
                      label={label}
                      value={String(
                        review[key as keyof CompleteJournalPayload] || "",
                      )}
                      onChange={(next) =>
                        setReview((current) => ({
                          ...current,
                          [key]: next,
                        }))
                      }
                      placeholder={label}
                      textareaClassNameOverride={`min-h-20 ${textareaClassName}`}
                    />
                  ))}
                  <div className="space-y-2 text-sm">
                    {[
                      ["followedTradingPlan", "Followed the plan"],
                      ["followedRiskManagement", "Respected risk"],
                      ["respectedStopLoss", "Honored stops"],
                      ["revengeTraded", "Revenge traded"],
                      ["overTraded", "Overtraded"],
                    ].map(([key, label]) => (
                      <label
                        key={key}
                        className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/[0.04]"
                      >
                        <span className="min-w-0 text-slate-600 dark:text-slate-300">
                          {label}
                        </span>
                        <input
                          type="checkbox"
                          className="h-5 w-5 shrink-0 accent-cyan-400"
                          checked={Boolean(
                            review[key as keyof CompleteJournalPayload],
                          )}
                          onChange={(event) =>
                            setReview((current) => ({
                              ...current,
                              [key]: event.target.checked,
                            }))
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <Button className="w-full" type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Complete journal"}
                  </Button>
                </form>
              </Card>
            </aside>
          </div>
        ) : (
          <Card>
            <EmptyState
              title="Journal not found"
              body="This session may have been removed."
            />
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
