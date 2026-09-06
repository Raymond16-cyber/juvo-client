"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { formatDate, formatMoney, formatNumber, pnlClass } from "@/lib/format";
import { brokerDebug } from "@/services/broker.service";
import { useBrokerStore } from "@/stores/broker.store";
import { useJournalStore } from "@/stores/journal.store";
import { useNoticeStore } from "@/stores/notice.store";
import {
  BrokerConnection,
  BrokerPosition,
} from "@/types/broker.types";
import { JournalHistoryItem, JournalListTradeSummary } from "@/types/journal.types";
import {
  ArrowUpRight,
  CheckCircle2,
  History,
  Link2,
  LoaderCircle,
  RefreshCw,
  RadioTower,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

const brokers = [
  {
    id: "mt5",
    name: "MetaTrader 5",
    body: "Manual journal stays first. Direct MT5 sync will import history without replacing your notes.",
    action: "coming-soon" as const,
  },
  {
    id: "ctrader",
    name: "cTrader",
    body: "Keep executions honest. Connection will map fills to the journal you already started.",
    action: "ctrader" as const,
  },
  {
    id: "csv",
    name: "CSV / broker statement",
    body: "Upload statements later. For now, log the trade while the decision is still warm.",
    action: "coming-soon" as const,
  },
];

const statusStyles: Record<BrokerConnection["status"], string> = {
  connecting: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  connected: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  disconnected: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
  error: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  reauthorization_required: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
};

export default function BrokerConnectionsPage() {
  const router = useRouter();
  const processedCallbackRef = useRef<string | null>(null);
  const showNotice = useNoticeStore((state) => state.showNotice);
  const startCTraderConnect = useBrokerStore(
    (state) => state.startCTraderConnect,
  );
  const completeCTraderConnect = useBrokerStore(
    (state) => state.completeCTraderConnect,
  );
  const fetchConnections = useBrokerStore((state) => state.fetchConnections);
  const fetchPositions = useBrokerStore((state) => state.fetchPositions);
  const syncCTrader = useBrokerStore((state) => state.syncCTrader);
  const connections = useBrokerStore((state) => state.connections);
  const positions = useBrokerStore((state) => state.positions);
  const lastSync = useBrokerStore((state) => state.lastSync);
  const isConnecting = useBrokerStore((state) => state.isConnecting);
  const isLoading = useBrokerStore((state) => state.isLoading);
  const error = useBrokerStore((state) => state.error);
  const journals = useJournalStore((state) => state.journals);
  const getUserJournals = useJournalStore((state) => state.getUserJournals);

  const cTraderConnection = useMemo(
    () =>
      connections.find(
        (connection) =>
          connection.provider === "ctrader" &&
          connection.status === "connected",
      ),
    [connections],
  );

  const importedCTraderTrades = useMemo(
    () => collectImportedCTraderTrades(journals),
    [journals],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const errorParam = params.get("error");
    const code = params.get("code");
    const callbackKey =
      connected === "1"
        ? "connected"
        : errorParam
          ? `error:${errorParam}`
          : code
            ? `code:${code}`
            : null;

    brokerDebug("page:query", {
      connected,
      error: errorParam,
      hasCode: Boolean(code),
      codeLength: code?.length || 0,
    });

    async function hydrateBrokerPage() {
      if (callbackKey && processedCallbackRef.current === callbackKey) {
        return;
      }
      if (callbackKey) {
        processedCallbackRef.current = callbackKey;
      }

      if (connected === "1") {
        showNotice({
          id: "ctrader-connected",
          title: "cTrader connected",
          body: "Your cTrader account is linked. Juvo can now show imported trades and open positions.",
          tone: "success",
        });
        await Promise.all([
          fetchConnections().catch(() => undefined),
          fetchPositions("open").catch(() => undefined),
          getUserJournals().catch(() => undefined),
        ]);
        router.replace("/home/accounts/broker");
        return;
      }

      if (errorParam) {
        showNotice({
          id: "ctrader-connection-failed",
          title: "cTrader connection failed",
          body: errorParam,
          tone: "warning",
        });
        await Promise.all([
          fetchConnections().catch(() => undefined),
          fetchPositions("open").catch(() => undefined),
          getUserJournals().catch(() => undefined),
        ]);
        router.replace("/home/accounts/broker");
        return;
      }

      if (code) {
        brokerDebug("page:exchanging-code");
        try {
          await completeCTraderConnect(code);
          await Promise.all([
            fetchPositions("open").catch(() => undefined),
            getUserJournals().catch(() => undefined),
          ]);
          showNotice({
            id: "ctrader-connected",
            title: "cTrader connected",
            body: "Your cTrader account is linked. Juvo can now show imported trades and open positions.",
            tone: "success",
          });
        } catch (completeError) {
          brokerDebug("page:exchange-failed", completeError);
        }
        router.replace("/home/accounts/broker");
        return;
      }

      await Promise.all([
        fetchConnections().catch(() => undefined),
        fetchPositions("open").catch(() => undefined),
        getUserJournals().catch(() => undefined),
      ]);
    }

    void hydrateBrokerPage();
  }, [
    completeCTraderConnect,
    fetchConnections,
    fetchPositions,
    getUserJournals,
    router,
    showNotice,
  ]);

  const handleConnectCtrader = async () => {
    brokerDebug("page:connect-clicked");
    await startCTraderConnect();
  };

  const handleSyncCtrader = async () => {
    brokerDebug("page:sync-clicked", {
      connectionId: cTraderConnection?.id,
    });

    try {
      await syncCTrader(cTraderConnection?.id);
      await getUserJournals().catch(() => undefined);
      showNotice({
        title: "cTrader synced",
        body: "Open positions and imported trade history are up to date.",
        tone: "success",
      });
    } catch (syncError) {
      brokerDebug("page:sync-failed", syncError);
      showNotice({
        title: "cTrader sync failed",
        body: "Juvo could not refresh cTrader data right now.",
        tone: "warning",
      });
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Accounts"
          title="Broker Connections"
          description="Juvo is a journal, not a copy-trader. Broker sync is for importing fills — you still write the psychology."
        />

        {error ? (
          <Card className="border-rose-200 p-4 dark:border-rose-500/30">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
              {error}
            </p>
          </Card>
        ) : null}

        {connections.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {connections.map((connection) => (
              <Card key={connection.id} className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {connection.provider === "ctrader" ? "cTrader" : "MetaAPI"}
                    </p>
                    <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                      {connection.brokerName ||
                        connection.accountNumber ||
                        "Linked account"}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[connection.status]}`}
                  >
                    {connection.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {connection.connectedAt
                    ? `Connected ${new Date(connection.connectedAt).toLocaleString()}`
                    : "Waiting for cTrader to finish authorizing Juvo."}
                </p>
              </Card>
            ))}
          </div>
        ) : null}

        {cTraderConnection ? (
          <Card className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <RadioTower size={17} />
                  cTrader sync
                </div>
                <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
                  Broker data visible in JUVO
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Closed cTrader deals appear as imported journal trades. Current
                  open cTrader positions stay separate until they close or you
                  decide to review them.
                </p>
              </div>
              <Button
                variant="ghost"
                className="w-full whitespace-nowrap lg:w-auto"
                disabled={isConnecting}
                onClick={handleSyncCtrader}
              >
                {isConnecting ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Syncing
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Sync cTrader
                  </>
                )}
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <BrokerMetric label="Open positions" value={positions.length} />
              <BrokerMetric
                label="Imported trades"
                value={importedCTraderTrades.length}
              />
              <BrokerMetric
                label="Last imported"
                value={
                  importedCTraderTrades[0]?.closedAt
                    ? formatDate(importedCTraderTrades[0].closedAt, {
                        month: "short",
                        day: "numeric",
                      })
                    : "None"
                }
              />
              <BrokerMetric
                label="Last sync"
                value={
                  cTraderConnection.lastSyncedAt
                    ? formatDate(cTraderConnection.lastSyncedAt, {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : lastSync
                      ? "Just now"
                      : "Pending"
                }
              />
            </div>
          </Card>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <RadioTower size={17} />
                  Current cTrader
                </div>
                <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                  Open positions
                </h2>
              </div>
              {isLoading ? (
                <LoaderCircle
                  size={18}
                  className="shrink-0 animate-spin text-slate-400"
                />
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              {positions.length ? (
                positions.map((position) => (
                  <BrokerPositionRow
                    key={position._id}
                    position={position}
                  />
                ))
              ) : (
                <BrokerEmptyState
                  title="No open cTrader positions"
                  body={
                    cTraderConnection
                      ? "Sync cTrader after opening a position and it will appear here."
                      : "Connect cTrader first to show live broker positions."
                  }
                />
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <History size={17} />
                  Past cTrader
                </div>
                <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                  Imported closed trades
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {importedCTraderTrades.length}
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {importedCTraderTrades.length ? (
                importedCTraderTrades.slice(0, 8).map((trade) => (
                  <ImportedTradeRow key={trade._id} trade={trade} />
                ))
              ) : (
                <BrokerEmptyState
                  title="No imported cTrader trades"
                  body={
                    cTraderConnection
                      ? "Sync cTrader to import closed deals into your journal history."
                      : "Connect cTrader first to import closed deal history."
                  }
                />
              )}
            </div>
          </Card>
        </section>

        <div className="grid gap-4 lg:grid-cols-3">
          {brokers.map((broker) => (
            <Card key={broker.id} className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                {broker.action === "ctrader" &&
                connections.some(
                  (connection) =>
                    connection.provider === "ctrader" &&
                    connection.status === "connected",
                ) ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Link2 size={20} />
                )}
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
                {broker.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {broker.body}
              </p>
              {broker.action === "ctrader" ? (
                <Button
                  variant="ghost"
                  className="mt-5"
                  disabled={isConnecting}
                  onClick={handleConnectCtrader}
                >
                  {isConnecting ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Connecting
                    </>
                  ) : connections.some(
                      (connection) =>
                        connection.provider === "ctrader" &&
                        connection.status === "connected",
                    ) ? (
                    "Reconnect cTrader"
                  ) : (
                    "Connect cTrader"
                  )}
                </Button>
              ) : (
                <Button variant="ghost" className="mt-5" disabled>
                  Sync coming next
                </Button>
              )}
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Broker sync is read-only. JUVO imports cTrader history and shows
            current positions without placing trades.
          </p>
          <Link href="/home/accounts/trading" className="mt-4 inline-block">
            <Button>Add trading account</Button>
          </Link>
        </Card>
      </div>
    </DashboardShell>
  );
}

type ImportedCTraderTrade = JournalListTradeSummary & {
  journalId: string;
  journalDate: string;
  accountLabel: string;
};

function collectImportedCTraderTrades(journals: JournalHistoryItem[]) {
  return journals
    .flatMap((journal) => {
      const accountLabel =
        journal.tradingAccount && typeof journal.tradingAccount !== "string"
          ? `${journal.tradingAccount.accountName} · ${journal.tradingAccount.broker}`
          : "cTrader account";

      return (journal.trades || [])
        .filter(
          (trade) =>
            trade.source === "ctrader" ||
            Boolean(trade.externalId || trade.externalPositionId),
        )
        .map((trade) => ({
          ...trade,
          journalId: journal._id,
          journalDate: journal.journalDate,
          accountLabel,
        }));
    })
    .sort(
      (first, second) =>
        new Date(second.closedAt || second.openedAt || second.journalDate).getTime() -
        new Date(first.closedAt || first.openedAt || first.journalDate).getTime(),
    );
}

function BrokerMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-slate-100 px-4 py-3 dark:bg-white/[0.05]">
      <p className="truncate text-lg font-bold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-1 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function BrokerPositionRow({ position }: { position: BrokerPosition }) {
  const isLong = position.direction === "long";

  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isLong ? (
              <ArrowUpRight size={16} className="text-emerald-500" />
            ) : (
              <TrendingDown size={16} className="text-rose-500" />
            )}
            <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">
              {position.symbol}
            </h3>
          </div>
          <p className="mt-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
            {position.direction} · {position.status}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Open
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <BrokerMiniMetric
          label="Entry"
          value={
            position.entryPrice
              ? formatNumber(position.entryPrice, 5)
              : "N/A"
          }
        />
        <BrokerMiniMetric
          label="Lots"
          value={position.lotSize ? formatNumber(position.lotSize, 2) : "N/A"}
        />
        <BrokerMiniMetric
          label="SL"
          value={position.stopLoss ? formatNumber(position.stopLoss, 5) : "N/A"}
        />
        <BrokerMiniMetric
          label="TP"
          value={position.takeProfit ? formatNumber(position.takeProfit, 5) : "N/A"}
        />
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {position.openedAt ? `Opened ${formatDate(position.openedAt)}` : "Open time unavailable"}
      </p>
    </div>
  );
}

function ImportedTradeRow({ trade }: { trade: ImportedCTraderTrade }) {
  const profitLoss = Number(trade.profitLoss || 0);
  const isLong = trade.direction === "long";

  return (
    <Link
      href={`/home/journal/${trade.journalId}`}
      className="block rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[0.03]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {isLong ? (
              <ArrowUpRight size={16} className="text-emerald-500" />
            ) : (
              <TrendingDown size={16} className="text-rose-500" />
            )}
            <h3 className="truncate text-sm font-bold text-slate-950 dark:text-white">
              {trade.symbol}
            </h3>
          </div>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
            {trade.accountLabel}
          </p>
        </div>
        <span className={`shrink-0 text-sm font-bold ${pnlClass(profitLoss)}`}>
          {formatMoney(profitLoss)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <BrokerMiniMetric label="Side" value={trade.direction} />
        <BrokerMiniMetric label="Status" value={trade.status} />
        <BrokerMiniMetric
          label="RR"
          value={
            typeof trade.achievedRR === "number"
              ? formatNumber(trade.achievedRR, 2)
              : "N/A"
          }
        />
        <BrokerMiniMetric
          label="Closed"
          value={formatDate(trade.closedAt || trade.journalDate, {
            month: "short",
            day: "numeric",
          })}
        />
      </div>
    </Link>
  );
}

function BrokerMiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/[0.05]">
      <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function BrokerEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center dark:border-white/10">
      <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {body}
      </p>
    </div>
  );
}
