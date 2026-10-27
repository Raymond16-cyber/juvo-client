"use client";

import Card from "@/components/ui/Card";
import { cn } from "@/lib/ui";
import type { JournalStreakData } from "@/types/journal.types";
import { Check, Flame } from "lucide-react";
import Link from "next/link";

type JournalStreakCardProps = {
  streak: JournalStreakData | null | undefined;
  loading?: boolean;
  onOpenJournal?: () => void;
};

function weekdayLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) return "";
  return new Date(Date.UTC(year, month - 1, day, 12))
    .toLocaleDateString(undefined, { weekday: "short", timeZone: "UTC" })
    .slice(0, 2);
}

export default function JournalStreakCard({
  streak,
  loading = false,
  onOpenJournal,
}: JournalStreakCardProps) {
  if (loading && !streak) {
    return (
      <Card className="animate-pulse p-5">
        <div className="h-12 w-12 rounded-2xl bg-orange-500/10" />
        <div className="mt-4 h-6 w-32 rounded bg-slate-200 dark:bg-white/10" />
        <div className="mt-2 h-4 w-48 rounded bg-slate-100 dark:bg-white/5" />
      </Card>
    );
  }

  const current = streak?.currentStreak || 0;
  const longest = streak?.longestStreak || 0;
  const todayCompleted = Boolean(streak?.todayCompleted);
  const week = streak?.week?.length
    ? streak.week
    : Array.from({ length: 7 }, (_, index) => ({
        date: `placeholder-${index}`,
        completed: false,
        isToday: index === 6,
      }));

  const headline =
    streak?.headline ||
    (current > 0 ? `${current}-day streak` : "Start your streak");
  const message =
    streak?.message ||
    (current > 0
      ? "Keep showing up for your trading journal."
      : "One meaningful journal entry is all it takes.");

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "relative grid h-12 w-12 place-items-center rounded-2xl",
              current > 0
                ? "bg-gradient-to-br from-orange-500/25 via-amber-400/20 to-rose-500/10 text-orange-500 shadow-[0_0_24px_rgba(249,115,22,0.18)]"
                : "bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500",
            )}
          >
            <Flame
              size={22}
              className={cn(current > 0 && "fill-orange-500/30")}
            />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-600/80 dark:text-orange-300/80">
              Journal streak
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950 dark:text-white">
              {headline}
            </p>
          </div>
        </div>
        {todayCompleted ? (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
            Today done
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {message}
      </p>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {week.map((day) => (
          <div key={day.date} className="text-center">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {day.date.startsWith("placeholder")
                ? ""
                : weekdayLabel(day.date)}
            </p>
            <div
              className={cn(
                "mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-bold transition",
                day.completed
                  ? "border-orange-500/40 bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-sm shadow-orange-500/20"
                  : "border-slate-200 bg-slate-50 text-slate-400 dark:border-white/10 dark:bg-white/[0.04]",
                day.isToday && !day.completed
                  ? "ring-2 ring-orange-400/40 ring-offset-2 ring-offset-white dark:ring-offset-slate-950"
                  : null,
              )}
              aria-label={`${day.date}${day.completed ? " completed" : " incomplete"}`}
            >
              {day.completed ? <Check size={14} strokeWidth={3} /> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-3 text-xs dark:border-white/10">
        <p className="text-slate-500 dark:text-slate-400">
          Longest streak{" "}
          <span className="font-bold text-slate-950 dark:text-white">
            {longest}
          </span>
        </p>
        <p className="font-semibold text-orange-600 dark:text-orange-300">
          {todayCompleted ? "Habit protected" : "Open journal"}
        </p>
      </div>
    </>
  );

  if (onOpenJournal) {
    return (
      <button
        type="button"
        onClick={onOpenJournal}
        data-tour="journal-streak"
        className="block w-full rounded-2xl text-left transition hover:-translate-y-0.5 hover:shadow-md"
      >
        <Card className="border-orange-500/10 p-5 dark:border-orange-400/10">
          {content}
        </Card>
      </button>
    );
  }

  return (
    <Link
      href="/home/journal"
      data-tour="journal-streak"
      className="block rounded-2xl transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <Card className="border-orange-500/10 p-5 dark:border-orange-400/10">
        {content}
      </Card>
    </Link>
  );
}
