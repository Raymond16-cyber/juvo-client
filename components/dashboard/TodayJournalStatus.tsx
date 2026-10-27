"use client";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/ui";
import type { JournalStatusData } from "@/types/journal.types";
import {
  CheckCircle2,
  CircleDashed,
  Coffee,
  NotebookPen,
  Plus,
  Rocket,
} from "lucide-react";

type TodayJournalStatusProps = {
  status?: JournalStatusData | null;
  loading?: boolean;
  onOpenMyDay?: (hasJournalToday?: boolean) => void;
  onLogTrade?: () => void;
  onNoTradeDay?: () => void;
};

const STATUS_COPY: Record<
  NonNullable<JournalStatusData["journalingStatus"]> | "not_started",
  { title: string; body: string; tone: string }
> = {
  not_started: {
    title: "Journaling not started",
    body: "Start My Day or record a no-trade day to keep your streak honest.",
    tone: "border-slate-200 bg-white dark:border-white/10 dark:bg-card",
  },
  day_started: {
    title: "Day started",
    body: "Your journal is open. Log a trade or close the day with a no-trade declaration.",
    tone: "border-sky-200/70 bg-sky-50/70 dark:border-sky-400/20 dark:bg-sky-400/10",
  },
  preparation_recorded: {
    title: "Preparation recorded",
    body: "Pre-market notes are in. Stay selective — only take A+ setups.",
    tone: "border-violet-200/70 bg-violet-50/60 dark:border-violet-400/20 dark:bg-violet-400/10",
  },
  trade_recorded: {
    title: "Trade journal recorded",
    body: "You have trades logged today. Finish with an end-of-day review when ready.",
    tone: "border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-400/20 dark:bg-emerald-400/10",
  },
  review_completed: {
    title: "End-of-day review completed",
    body: "Today's review is done. Consistency compounds.",
    tone: "border-emerald-300/80 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-400/10",
  },
  no_trade_day: {
    title: "No-trade day recorded",
    body: "Discipline protected. Staying out can be the A+ decision.",
    tone: "border-orange-200/80 bg-orange-50/70 dark:border-orange-400/20 dark:bg-orange-400/10",
  },
};

export default function TodayJournalStatus({
  status,
  loading = false,
  onOpenMyDay,
  onLogTrade,
  onNoTradeDay,
}: TodayJournalStatusProps) {
  const key = status?.journalingStatus || "not_started";
  const copy = STATUS_COPY[key] || STATUS_COPY.not_started;
  const hasJournal = Boolean(status?.hasJournalToday);
  const doneToday = Boolean(status?.streak?.todayCompleted);
  const Icon =
    key === "no_trade_day"
      ? Coffee
      : key === "review_completed" || doneToday
        ? CheckCircle2
        : key === "not_started"
          ? CircleDashed
          : NotebookPen;

  if (loading && !status) {
    return (
      <section className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-card">
        <div className="h-5 w-40 rounded bg-slate-200 dark:bg-white/10" />
        <div className="mt-3 h-4 w-72 max-w-full rounded bg-slate-100 dark:bg-white/5" />
      </section>
    );
  }

  return (
    <section
      data-tour="today-journal-status"
      className={cn(
        "rounded-2xl border px-4 py-4 sm:px-5",
        copy.tone,
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/80 text-slate-700 shadow-sm dark:bg-white/10 dark:text-white">
            <Icon size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Today
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
              {copy.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {copy.body}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <Button
            type="button"
            className="h-10"
            onClick={() => (hasJournal ? onLogTrade?.() : onOpenMyDay?.(false))}
          >
            {hasJournal ? <Plus size={16} /> : <Rocket size={16} />}
            {hasJournal ? "Log Trade" : "Start My Day"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-10"
            onClick={() => onNoTradeDay?.()}
          >
            <Coffee size={16} />
            {key === "no_trade_day" ? "View no-trade day" : "No Trade Today"}
          </Button>
          {hasJournal ? (
            <Button
              type="button"
              variant="ghost"
              className="h-10"
              onClick={() => onOpenMyDay?.(true)}
            >
              <NotebookPen size={16} />
              Open My Day
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
