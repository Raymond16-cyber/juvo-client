"use client";

import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/axios";
import {
  getAiAccessService,
  hasAiFeature,
  journalInterviewerService,
} from "@/services/ai.service";
import { AiAccess } from "@/types/ai.types";
import { MessageCircleQuestion, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type SmartJournalInterviewerProps = {
  journalId?: string;
  tradeId?: string;
  noTradeDayId?: string;
  entrySnapshot?: Record<string, unknown>;
  className?: string;
};

export default function SmartJournalInterviewer({
  journalId,
  tradeId,
  noTradeDayId,
  entrySnapshot,
  className,
}: SmartJournalInterviewerProps) {
  const [access, setAccess] = useState<AiAccess | null>(null);
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [upgradeNeeded, setUpgradeNeeded] = useState(false);

  useEffect(() => {
    getAiAccessService()
      .then((response) => setAccess(response.data))
      .catch(() => undefined);
  }, []);

  const canUse = hasAiFeature(access, "smart_journal_interviewer");

  const loadQuestions = async () => {
    if (!canUse) {
      setUpgradeNeeded(true);
      return;
    }
    setLoading(true);
    setError(null);
    setUpgradeNeeded(false);
    try {
      const response = await journalInterviewerService({
        journalId,
        tradeId,
        noTradeDayId,
        entrySnapshot,
      });
      setQuestions(response.data.questions || []);
      setOpen(true);
    } catch (loadError) {
      const code =
        typeof loadError === "object" &&
        loadError &&
        "response" in loadError &&
        typeof (loadError as { response?: { data?: { code?: string } } })
          .response?.data?.code === "string"
          ? (loadError as { response?: { data?: { code?: string } } }).response
              ?.data?.code
          : null;
      if (code === "ENTITLEMENT_REQUIRED" || code === "AI_USAGE_LIMIT") {
        setUpgradeNeeded(true);
      }
      setError(
        getApiErrorMessage(
          loadError,
          "Juvo could not prepare reflection questions.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <section
      className={`rounded-2xl border border-primary/20 bg-primary/5 p-4 dark:border-primary/30 dark:bg-primary/10 ${className || ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
            <MessageCircleQuestion size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              Optional reflection
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Juvo can ask 1–2 follow-ups from what you already wrote.
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss interviewer"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          onClick={() => setOpen(false)}
        >
          <X size={16} />
        </button>
      </div>

      {questions.length ? (
        <ul className="mt-4 space-y-2">
          {questions.map((question) => (
            <li
              key={question}
              className="juvo-break-words rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
            >
              {question}
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="h-11 px-3 text-sm"
            disabled={loading}
            onClick={() => void loadQuestions()}
          >
            <Sparkles size={14} />
            {loading ? "Thinking..." : "Ask Juvo"}
          </Button>
          {upgradeNeeded ? (
            <Link
              href="/home/general/subscriptions"
              className="text-sm font-semibold text-primary"
            >
              Upgrade for more AI
            </Link>
          ) : null}
        </div>
      )}

      {error ? (
        <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>
      ) : null}
    </section>
  );
}
