"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getApiErrorMessage } from "@/lib/axios";
import {
  getAiAccessService,
  hasAiFeature,
  periodReviewService,
} from "@/services/ai.service";
import { AiAccess } from "@/types/ai.types";
import { CalendarRange, LockKeyhole, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type PeriodReview = {
  headline?: string;
  narrative?: string;
  summary?: string;
  wins?: string[];
  leaks?: string[];
  improvements?: string[];
  attention?: string[];
  patterns?: string[];
  comparison?: string;
  nextFocus?: string;
  insufficientData?: boolean;
  cached?: boolean;
  label?: string;
  stats?: {
    periodPnl?: number;
    periodTrades?: number;
    journalDays?: number;
  };
};

export default function PeriodReviewCard() {
  const [access, setAccess] = useState<AiAccess | null>(null);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState<PeriodReview | null>(null);

  useEffect(() => {
    getAiAccessService()
      .then((response) => setAccess(response.data))
      .catch(() => undefined);
  }, []);

  const canUse = hasAiFeature(access, "ai_period_review");

  const loadReview = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await periodReviewService({ period, forceRefresh });
      setReview((response.data || null) as PeriodReview);
    } catch (loadError) {
      setError(
        getApiErrorMessage(
          loadError,
          "Juvo could not generate this period review.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const improvements = review?.wins || review?.improvements || [];
  const attention = review?.leaks || review?.attention || [];

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
            <CalendarRange size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">
              AI period review
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Narrative summary grounded in your analytics and journals.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(["week", "month"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setPeriod(value);
                setReview(null);
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                period === value
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
              }`}
            >
              {value === "week" ? "Weekly" : "Monthly"}
            </button>
          ))}
        </div>
      </div>

      {!canUse ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
          <div className="flex items-center gap-2 font-semibold">
            <LockKeyhole size={14} />
            Pro and Super
          </div>
          <p className="mt-1">
            Upgrade to unlock weekly and monthly AI reviews.
          </p>
          <Link
            href="/home/general/subscriptions"
            className="mt-2 inline-block font-semibold text-primary"
          >
            View plans
          </Link>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            className="h-9 px-3 text-sm"
            disabled={loading}
            onClick={() => void loadReview(false)}
          >
            {loading ? "Generating..." : "Generate review"}
          </Button>
          {review ? (
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-3 text-sm"
              disabled={loading}
              onClick={() => void loadReview(true)}
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
          ) : null}
        </div>
      )}

      {error ? (
        <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>
      ) : null}

      {review ? (
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          {review.insufficientData ? (
            <p>Not enough journal data for a confident review yet.</p>
          ) : null}
          {review.headline ? (
            <p className="text-base font-semibold text-slate-900 dark:text-white">
              {review.headline}
            </p>
          ) : null}
          {review.narrative || review.summary ? (
            <p className="leading-6">{review.narrative || review.summary}</p>
          ) : null}
          {review.stats ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Based on {review.stats.journalDays || 0} journaled days ·{" "}
              {review.stats.periodTrades || 0} trades
              {review.cached ? " · cached" : ""}
            </p>
          ) : null}
          {improvements.length ? (
            <div>
              <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                Improvements
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {attention.length ? (
            <div>
              <p className="font-semibold text-amber-700 dark:text-amber-300">
                Needs attention
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {attention.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {review.patterns?.length ? (
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-100">
                Patterns
              </p>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {review.patterns.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {review.comparison ? <p>{review.comparison}</p> : null}
          {review.nextFocus ? (
            <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 dark:border-primary/30 dark:bg-primary/10">
              Next focus: {review.nextFocus}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
