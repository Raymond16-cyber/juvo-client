import { formatDate, formatMoney, formatNumber, pnlClass } from "@/lib/format";
import {
  panelTransition,
  subtleListContainer,
  subtleListItem,
} from "@/lib/motion";
import { BrokerPosition } from "@/types/broker.types";
import { JournalHistoryItem } from "@/types/journal.types";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, RadioTower, TrendingDown } from "lucide-react";
import Link from "next/link";

type RecentTradesProps = {
  journals?: JournalHistoryItem[];
  currency?: string;
  brokerPositions?: BrokerPosition[];
};

export default function RecentTrades({
  journals = [],
  currency = "USD",
  brokerPositions = [],
}: RecentTradesProps) {
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
            Trades
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            Live & Recent
          </h2>
        </div>
        <Link href="/home/journal" className="text-sm font-bold text-primary">
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {brokerPositions.length ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              <RadioTower size={14} />
              Live cTrader positions
            </div>
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="shown"
              variants={subtleListContainer}
            >
              <AnimatePresence initial={false}>
                {brokerPositions.slice(0, 3).map((position) => (
                  <LivePositionCard
                    key={position._id}
                    position={position}
                    currency={currency}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : null}

        {trades.length ? (
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="shown"
            variants={subtleListContainer}
          >
            {trades.map((trade) => {
              const isWin = Number(trade.profitLoss || 0) > 0;
              const isLoss = Number(trade.profitLoss || 0) < 0;

              return (
                <motion.div key={trade._id} variants={subtleListItem}>
                  <Link
                    href={`/home/journal/${trade.journalId}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-950 dark:text-white">
                          {trade.symbol}
                        </p>
                        {trade.direction === "long" ? (
                          <ArrowUpRight size={14} className="text-emerald-500" />
                        ) : (
                          <TrendingDown size={14} className="text-rose-500" />
                        )}
                        {trade.source === "ctrader" ? (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-bold text-primary">
                            cTrader
                          </span>
                        ) : null}
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
                        {trade.direction} · {trade.session || "No session"} ·{" "}
                        {trade.instrument}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`font-bold ${pnlClass(trade.profitLoss || 0)}`}>
                        {formatMoney(trade.profitLoss || 0, currency)}
                      </p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        RR {trade.achievedRR || trade.plannedRR}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
            No journal trades yet. Start your day or sync cTrader history.
          </p>
        )}
      </div>
    </section>
  );
}

function LivePositionCard({
  position,
  currency,
}: {
  position: BrokerPosition;
  currency: string;
}) {
  const brokerPnl =
    position.live?.netUnrealizedPnl ?? position.live?.grossUnrealizedPnl;
  const fallbackPnl = position.live?.floatingProfitIndicative;
  const displayPnl = brokerPnl ?? fallbackPnl;
  const positionCurrency =
    typeof position.tradingAccount === "object"
      ? position.tradingAccount.currency
      : currency;

  return (
    <motion.div
      layout
      variants={subtleListItem}
      initial="hidden"
      animate="shown"
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={panelTransition}
      className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 rounded-2xl border border-cyan-200 bg-cyan-50/70 p-4 dark:border-cyan-400/20 dark:bg-cyan-400/10"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-slate-950 dark:text-white">
            {position.symbol}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[11px] font-bold uppercase text-cyan-700 dark:text-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
            Live
          </span>
        </div>
        <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">
          {position.direction} ·{" "}
          {position.lotSize
            ? `${formatNumber(position.lotSize, 2)} lots`
            : "Lot size unavailable"}
        </p>
      </div>
      <div className="shrink-0 text-right tabular-nums">
        <motion.p
          key={`${position._id}-${displayPnl ?? position.live?.currentPrice ?? "live"}`}
          initial={{ opacity: 0.65, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.16 }}
          className={`font-bold ${
            typeof displayPnl === "number"
              ? pnlClass(displayPnl)
              : "text-slate-950 dark:text-white"
          }`}
        >
          {typeof displayPnl === "number"
            ? formatMoney(displayPnl, positionCurrency)
            : position.live?.currentPrice
              ? formatNumber(position.live.currentPrice, 5)
              : "Live"}
        </motion.p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {typeof brokerPnl === "number"
            ? "Broker P/L"
            : typeof fallbackPnl === "number"
              ? "Indicative"
              : position.openedAt
                ? formatDate(position.openedAt, {
                    month: "short",
                    day: "numeric",
                  })
                : "Synced"}
        </p>
      </div>
      <div className="col-span-2 grid grid-cols-3 gap-2 text-xs tabular-nums">
        <PositionMini label="Entry" value={position.entryPrice} />
        <PositionMini label="Bid" value={position.live?.currentBid} />
        <PositionMini label="Ask" value={position.live?.currentAsk} />
      </div>
    </motion.div>
  );
}

function PositionMini({
  label,
  value,
}: {
  label: string;
  value?: number;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-white/70 px-2.5 py-2 dark:bg-white/[0.04]">
      <p className="truncate font-bold text-slate-950 dark:text-white">
        {typeof value === "number" ? formatNumber(value, 5) : "N/A"}
      </p>
      <p className="mt-0.5 truncate text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}
