import { formatMoney, pnlClass } from "@/lib/format";
import { JournalHistoryItem } from "@/types/journal.types";
import Link from "next/link";

type RecentTradesProps = {
  journals?: JournalHistoryItem[];
};

export default function RecentTrades({ journals = [] }: RecentTradesProps) {
  const trades = journals
    .flatMap((journal) =>
      (journal.trades || []).map((trade) => ({
        ...trade,
        journalId: journal._id,
        journalDate: journal.journalDate,
      })),
    )
    .sort((a, b) => {
      const left = new Date(a.openedAt || a.createdAt || 0).getTime();
      const right = new Date(b.openedAt || b.createdAt || 0).getTime();
      return right - left;
    })
    .slice(0, 4);

  return (
    <section
      data-dashboard-card
      className="dashboard-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Journal
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            Recent Trades
          </h2>
        </div>
        <Link href="/home/journal" className="text-sm font-bold text-primary">
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {trades.length ? (
          trades.map((trade) => {
            const isWin = Number(trade.profitLoss || 0) > 0;
            const isLoss = Number(trade.profitLoss || 0) < 0;

            return (
              <Link
                key={trade._id}
                href={`/home/journal/${trade.journalId}`}
                className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-950 dark:text-white">
                      {trade.symbol}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        trade.status === "Open"
                          ? "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300"
                          : isWin
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                            : isLoss
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
                              : "bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                      }`}
                    >
                      {trade.status}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">
                    {trade.direction} · {trade.session || "No session"} · {trade.instrument}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-bold ${pnlClass(trade.profitLoss || 0)}`}>
                    {formatMoney(trade.profitLoss || 0)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    RR {trade.achievedRR || trade.plannedRR}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
            No trades yet. Start your day and log the first execution.
          </p>
        )}
      </div>
    </section>
  );
}
