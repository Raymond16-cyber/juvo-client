const trades = [
  { pair: "XAU/USD", setup: "Breakout retest", result: "+$840", rr: "1:2.8", status: "Win" },
  { pair: "EUR/USD", setup: "London pullback", result: "-$210", rr: "1:1.4", status: "Loss" },
  { pair: "NAS100", setup: "Liquidity sweep", result: "+$1,120", rr: "1:3.1", status: "Win" },
  { pair: "GBP/JPY", setup: "Trend continuation", result: "+$360", rr: "1:1.9", status: "Win" },
];

export default function RecentTrades() {
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
        <button className="text-sm font-bold text-primary">View all</button>
      </div>

      <div className="space-y-4">
        {trades.map((trade) => (
          <div
            key={`${trade.pair}-${trade.setup}`}
            className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-slate-950 dark:text-white">
                  {trade.pair}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    trade.status === "Win"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
                  }`}
                >
                  {trade.status}
                </span>
              </div>
              <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">
                {trade.setup}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p
                className={`font-bold ${
                  trade.result.startsWith("+")
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {trade.result}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                RR {trade.rr}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
