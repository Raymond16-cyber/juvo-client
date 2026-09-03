"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";
import { getRecordCurrency } from "@/lib/account";
import { formatDate, formatMoney, pnlClass } from "@/lib/format";
import { controlClassName, textareaClassName } from "@/lib/ui";
import { useJournalStore } from "@/stores/journal.store";
import { CompleteJournalPayload } from "@/types/journal.types";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  NotebookPen,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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
  const [closeStatus, setCloseStatus] = useState<"Closed" | "Breakeven" | "Cancelled">(
    "Closed",
  );
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!journalId) return;
    getJournalById(journalId).catch(() => undefined);
  }, [getJournalById, journalId]);

  useEffect(() => {
    if (!journal) return;
    setReview({
      afterTrading: journal.psychology?.afterTrading || "",
      confidenceAfter: journal.psychology?.confidenceAfter || 7,
      biggestMistake: journal.review?.biggestMistake || "",
      biggestWin: journal.review?.biggestWin || "",
      lessonLearned: journal.review?.lessonLearned || "",
      improvementsTomorrow: journal.review?.improvementsTomorrow || "",
      overallThoughts: journal.review?.overallThoughts || "",
      followedTradingPlan: journal.discipline?.followedTradingPlan ?? true,
      followedRiskManagement: journal.discipline?.followedRiskManagement ?? true,
      revengeTraded: journal.discipline?.revengeTraded ?? false,
      overTraded: journal.discipline?.overTraded ?? false,
      respectedStopLoss: journal.discipline?.respectedStopLoss ?? true,
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

  const handleCloseTrade = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!journal || !closingTradeId) return;
    const response = await closeTrade(journal._id, closingTradeId, {
      exitPrice: Number(exitPrice),
      status: closeStatus,
    });
    setClosingTradeId(null);
    setExitPrice("");
    const accountStatus = response.tradingAccount?.status;
    setMessage(
      accountStatus === "Passed"
        ? "Trade closed. This trading account has passed its profit target."
        : accountStatus === "Breached"
          ? "Trade closed. This trading account has been breached."
          : response.message || "Trade closed.",
    );
    await getJournalById(journal._id);
  };

  const handleComplete = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!journal) return;
    await completeJournal(journal._id, review);
    setMessage("Day reviewed. Juvo saved the process notes.");
  };

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
            <EmptyState title="Loading session" body="Pulling trades and notes." />
          </Card>
        ) : journal ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  ["P/L", formatMoney(journal.totalProfitLoss || 0, journalCurrency), pnlClass(journal.totalProfitLoss || 0)],
                  ["Open", String(journal.openTrades || 0), ""],
                  ["Closed", String(journal.closedTrades || 0), ""],
                  ["Discipline", `${journal.discipline?.score ?? "—"}`, ""],
                ].map(([label, value, tone]) => (
                  <Card key={label} className="p-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                    <p className={`mt-2 text-2xl font-bold ${tone || "text-slate-950 dark:text-white"}`}>
                      {value}
                    </p>
                  </Card>
                ))}
              </div>

              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <NotebookPen size={18} className="text-primary" />
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    Pre-market note
                  </h2>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {journal.psychology?.beforeTrading || "No pre-market note was captured."}
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
                    <article key={trade._id} className="p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-base font-bold text-slate-950 dark:text-white">
                            {trade.symbol} · {trade.direction}
                          </p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {trade.instrument} · {trade.session || "No session"} · {trade.status}
                            {trade.tradingAccount &&
                            typeof trade.tradingAccount !== "string"
                              ? ` · ${trade.tradingAccount.accountName}`
                              : ""}
                          </p>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Entry {trade.entryPrice} · SL {trade.stopLoss} · TP {trade.takeProfit} · Size {trade.lotSize}
                          </p>
                          {trade.notes ? (
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                              {trade.notes}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${pnlClass(trade.profitLoss || 0)}`}>
                            {formatMoney(
                              trade.profitLoss || 0,
                              getRecordCurrency(trade, journalCurrency),
                            )}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            RR {trade.achievedRR || trade.plannedRR}
                          </p>
                          {trade.status === "Open" ? (
                            <Button
                              variant="ghost"
                              className="mt-3 h-9 px-3"
                              onClick={() => {
                                setClosingTradeId(trade._id);
                                setExitPrice(String(trade.takeProfit || ""));
                              }}
                            >
                              Close trade
                            </Button>
                          ) : null}
                        </div>
                      </div>
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
                  <form className="mt-4 grid gap-3 sm:grid-cols-3" onSubmit={handleCloseTrade}>
                    <input
                      className={controlClassName}
                      type="number"
                      min="0"
                      step="any"
                      required
                      placeholder="Exit price"
                      value={exitPrice}
                      onChange={(event) => setExitPrice(event.target.value)}
                    />
                    <select
                      className={controlClassName}
                      value={closeStatus}
                      onChange={(event) =>
                        setCloseStatus(event.target.value as typeof closeStatus)
                      }
                    >
                      <option value="Closed">Closed</option>
                      <option value="Breakeven">Breakeven</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <Button type="submit" disabled={isLoading}>
                      Save close
                    </Button>
                  </form>
                </Card>
              ) : null}
            </div>

            <aside className="space-y-6">
              {journal.ai?.summary || journal.ai?.feedback ? (
                <Card className="p-5">
                  <div className="flex items-center gap-2 text-primary">
                    <Bot size={18} />
                    <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                      Juvo review
                    </h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {journal.ai.summary || journal.ai.feedback}
                  </p>
                  {journal.ai.feedback && journal.ai.summary ? (
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {journal.ai.feedback}
                    </p>
                  ) : null}
                </Card>
              ) : null}

              <Card className="p-5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-primary" />
                  <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                    End of day
                  </h2>
                </div>
                <form className="mt-4 space-y-4" onSubmit={handleComplete}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    After trading
                    <textarea
                      className={`mt-2 ${textareaClassName}`}
                      value={review.afterTrading}
                      onChange={(event) =>
                        setReview((current) => ({
                          ...current,
                          afterTrading: event.target.value,
                        }))
                      }
                      placeholder="How did the session actually feel?"
                    />
                  </label>
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
                    <label
                      key={key}
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
                    >
                      {label}
                      <input
                        className={`mt-2 ${controlClassName}`}
                        value={String(review[key as keyof CompleteJournalPayload] || "")}
                        onChange={(event) =>
                          setReview((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                      />
                    </label>
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
                        className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/[0.04]"
                      >
                        <span className="text-slate-600 dark:text-slate-300">{label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(review[key as keyof CompleteJournalPayload])}
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
            <EmptyState title="Journal not found" body="This session may have been removed." />
          </Card>
        )}
      </div>
    </DashboardShell>
  );
}
