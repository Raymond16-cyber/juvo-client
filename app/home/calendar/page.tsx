"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { formatMoney, pnlClass } from "@/lib/format";
import { useJournalStore } from "@/stores/journal.store";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function CalendarPage() {
  const journals = useJournalStore((state) => state.journals);
  const getUserJournals = useJournalStore((state) => state.getUserJournals);
  const [cursor, setCursor] = useState(() => new Date());

  useEffect(() => {
    getUserJournals().catch(() => undefined);
  }, [getUserJournals]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = useMemo(() => {
    const map = new Map<string, typeof journals>();
    journals.forEach((journal) => {
      const key = new Date(journal.journalDate).toISOString().slice(0, 10);
      const current = map.get(key) || [];
      current.push(journal);
      map.set(key, current);
    });
    return map;
  }, [journals]);

  const cells = Array.from({ length: startWeekday + daysInMonth }, (_, index) => {
    if (index < startWeekday) return null;
    return index - startWeekday + 1;
  });

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Calendar"
          title="Juvo Calendar"
          description="See which days you actually journaled. Green and red are P/L, empty days are the real leak."
          actions={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 dark:border-white/10"
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <p className="min-w-36 text-center text-sm font-bold text-slate-950 dark:text-white">
                {cursor.toLocaleString("en", { month: "long", year: "numeric" })}
              </p>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 dark:border-white/10"
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          }
        />

        <Card className="overflow-hidden p-5">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {cells.map((day, index) => {
              if (!day) return <div key={`empty-${index}`} />;
              const key = new Date(year, month, day).toISOString().slice(0, 10);
              const dayJournals = byDate.get(key) || [];
              const pnl = dayJournals.reduce(
                (total, journal) => total + (journal.totalProfitLoss || 0),
                0,
              );
              const first = dayJournals[0];

              const inner = (
                <div
                  className={`min-h-24 rounded-2xl border p-3 text-left ${
                    dayJournals.length
                      ? "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04]"
                      : "border-transparent bg-transparent"
                  }`}
                >
                  <p className="text-sm font-bold text-slate-950 dark:text-white">{day}</p>
                  {dayJournals.length ? (
                    <>
                      <p className={`mt-2 text-xs font-semibold ${pnlClass(pnl)}`}>
                        {formatMoney(pnl)}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {dayJournals.reduce((total, journal) => total + (journal.tradesCount || 0), 0)} trades
                      </p>
                    </>
                  ) : null}
                </div>
              );

              return first ? (
                <Link key={key} href={`/home/journal/${first._id}`}>
                  {inner}
                </Link>
              ) : (
                <div key={key}>{inner}</div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
