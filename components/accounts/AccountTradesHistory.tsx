"use client";

import HistoryModal from "@/components/ui/HistoryModal";
import HistoryPreview from "@/components/ui/HistoryPreview";
import { formatMoney, pnlClass } from "@/lib/format";
import { useMemo, useState } from "react";

const PREVIEW_LIMIT = 10;
const PAGE_SIZE = 10;

type AccountTrade = {
  _id: string;
  symbol: string;
  direction?: string;
  status?: string;
  session?: string;
  profitLoss?: number;
  profitLossCurrency?: string;
};

type AccountTradesHistoryProps = {
  trades: AccountTrade[];
  currency: string;
  title?: string;
};

function TradeRow({
  trade,
  currency,
}: {
  trade: AccountTrade;
  currency: string;
}) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/[0.04]">
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-950 dark:text-white">
          {trade.symbol} · {trade.direction}
        </p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
          {trade.status}
          {trade.session ? ` · ${trade.session}` : ""}
        </p>
      </div>
      <p
        className={`shrink-0 break-words font-bold ${pnlClass(trade.profitLoss || 0)}`}
      >
        {formatMoney(
          trade.profitLoss || 0,
          trade.profitLossCurrency || currency,
        )}
      </p>
    </div>
  );
}

export default function AccountTradesHistory({
  trades,
  currency,
  title = "Account trades",
}: AccountTradesHistoryProps) {
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const preview = useMemo(() => trades.slice(0, PREVIEW_LIMIT), [trades]);
  const hasMore = trades.length > PREVIEW_LIMIT;
  const modalItems = useMemo(
    () => trades.slice(0, visibleCount),
    [trades, visibleCount],
  );
  const modalHasMore = visibleCount < trades.length;

  if (!trades.length) {
    return (
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Trades logged while this account is active will appear here.
      </p>
    );
  }

  return (
    <div className="mt-5 border-t border-slate-200 pt-4 dark:border-white/10">
      <HistoryPreview
        title={title}
        countLabel={`${trades.length} total`}
        hasMore={hasMore}
        onSeeAll={() => {
          setVisibleCount(PAGE_SIZE);
          setOpen(true);
        }}
        seeAllLabel="See full trade history"
      >
        <div className="mt-3 space-y-2">
          {preview.map((trade) => (
            <TradeRow key={trade._id} trade={trade} currency={currency} />
          ))}
        </div>
      </HistoryPreview>

      <HistoryModal
        open={open}
        title={title}
        eyebrow="Trades"
        onClose={() => setOpen(false)}
        hasMore={modalHasMore}
        onLoadMore={() =>
          setVisibleCount((current) =>
            Math.min(current + PAGE_SIZE, trades.length),
          )
        }
      >
        <div className="space-y-2">
          {modalItems.map((trade) => (
            <TradeRow key={trade._id} trade={trade} currency={currency} />
          ))}
        </div>
      </HistoryModal>
    </div>
  );
}
