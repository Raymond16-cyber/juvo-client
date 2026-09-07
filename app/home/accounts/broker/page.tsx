"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/format";
import { useBrokerStore } from "@/stores/broker.store";
import { useNoticeStore } from "@/stores/notice.store";
import { BrokerConnection } from "@/types/broker.types";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Database,
  History,
  Link2,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Unplug,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";

const brokerOptions = [
  {
    id: "ctrader",
    name: "cTrader",
    body: "Read-only sync for account data, open positions, and closed deal history.",
    action: "ctrader" as const,
  },
  {
    id: "mt5",
    name: "MetaTrader 5",
    body: "Planned integration for traders who want MT5 history imported into JUVO.",
    action: "coming-soon" as const,
  },
  {
    id: "csv",
    name: "CSV / broker statement",
    body: "Planned import path for broker statements and manual reconciliation.",
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

const statusCopy: Record<BrokerConnection["status"], string> = {
  connecting: "Authorization started",
  connected: "Connected",
  disconnected: "Disconnected",
  error: "Needs attention",
  reauthorization_required: "Reconnect required",
};

type IconType = React.ComponentType<{ size?: number; className?: string }>;

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

  const cTraderConnection = useMemo(
    () => connections.find((connection) => connection.provider === "ctrader"),
    [connections],
  );
  const connectedCTrader = cTraderConnection?.status === "connected";
  const needsReauth = cTraderConnection?.status === "reauthorization_required";

  const lastSyncLabel = cTraderConnection?.lastSyncedAt
    ? formatDate(cTraderConnection.lastSyncedAt, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : lastSync
      ? "Just now"
      : "Not synced yet";

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

    async function hydrateBrokerPage() {
      if (callbackKey && processedCallbackRef.current === callbackKey) return;
      if (callbackKey) processedCallbackRef.current = callbackKey;

      if (connected === "1") {
        showNotice({
          id: "ctrader-connected",
          title: "cTrader connected",
          body: "Your cTrader account is linked. JUVO can now sync broker data in read-only mode.",
          tone: "success",
        });
        await Promise.all([
          fetchConnections().catch(() => undefined),
          fetchPositions("open").catch(() => undefined),
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
        ]);
        router.replace("/home/accounts/broker");
        return;
      }

      if (code) {
        try {
          await completeCTraderConnect(code);
          await fetchPositions("open").catch(() => undefined);
          showNotice({
            id: "ctrader-connected",
            title: "cTrader connected",
            body: "Your cTrader account is linked. JUVO can now sync broker data in read-only mode.",
            tone: "success",
          });
        } catch {
          showNotice({
            id: "ctrader-connection-failed",
            title: "cTrader connection failed",
            body: "JUVO could not finish the cTrader connection.",
            tone: "warning",
          });
        }
        router.replace("/home/accounts/broker");
        return;
      }

      await Promise.all([
        fetchConnections().catch(() => undefined),
        fetchPositions("open").catch(() => undefined),
      ]);
    }

    void hydrateBrokerPage();
  }, [
    completeCTraderConnect,
    fetchConnections,
    fetchPositions,
    router,
    showNotice,
  ]);

  const handleConnectCtrader = async () => {
    await startCTraderConnect();
  };

  const handleSyncCtrader = async () => {
    if (!connectedCTrader) {
      showNotice({
        title: "Connect cTrader first",
        body: "JUVO needs an active cTrader connection before it can sync broker data.",
        tone: "warning",
      });
      return;
    }

    try {
      await syncCTrader(cTraderConnection?.id);
      showNotice({
        title: "cTrader synced",
        body: "Broker data has been refreshed.",
        tone: "success",
      });
    } catch {
      showNotice({
        title: "cTrader sync failed",
        body: "JUVO could not refresh cTrader data right now.",
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
          description="Manage read-only broker access, sync health, and where broker data flows inside JUVO."
        />

        {error ? (
          <Card className="border-rose-200 p-4 dark:border-rose-500/30">
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
              {error}
            </p>
          </Card>
        ) : null}

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
          <Card className="p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <ShieldCheck size={17} />
                  Read-only broker access
                </div>
                <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">
                  {connectedCTrader
                    ? "cTrader is connected"
                    : needsReauth
                      ? "cTrader needs reconnecting"
                      : "Connect a broker to JUVO"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                  JUVO reads account activity for journaling and analytics. It does
                  not place, edit, or close broker trades.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                <Button
                  className="w-full sm:w-auto"
                  disabled={isConnecting}
                  onClick={handleConnectCtrader}
                >
                  {isConnecting ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Connecting
                    </>
                  ) : (
                    <>
                      <Link2 size={16} />
                      {connectedCTrader ? "Reconnect cTrader" : "Connect cTrader"}
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto"
                  disabled={isConnecting || !connectedCTrader}
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
                      Sync broker
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatusMetric
                icon={connectedCTrader ? CheckCircle2 : Unplug}
                label="Connection"
                value={
                  cTraderConnection
                    ? statusCopy[cTraderConnection.status]
                    : "Not connected"
                }
                tone={connectedCTrader ? "good" : needsReauth ? "bad" : "muted"}
              />
              <StatusMetric
                icon={Activity}
                label="Live tracking"
                value={
                  connectedCTrader
                    ? `${positions.length} open position${positions.length === 1 ? "" : "s"}`
                    : "Offline"
                }
                tone={connectedCTrader ? "good" : "muted"}
              />
              <StatusMetric
                icon={Clock3}
                label="Last sync"
                value={lastSyncLabel}
                tone={lastSync || cTraderConnection?.lastSyncedAt ? "good" : "muted"}
              />
              <StatusMetric
                icon={Database}
                label="Mode"
                value="Read-only"
                tone="good"
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <AlertTriangle size={17} />
              Permission boundary
            </div>
            <div className="mt-5 space-y-3">
              <PermissionItem checked label="Read account profile" />
              <PermissionItem checked label="Import closed deals" />
              <PermissionItem checked label="Track open positions" />
              <PermissionItem checked={false} label="Place or close trades" />
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <DestinationCard
            icon={Activity}
            title="Live positions"
            body="Open cTrader positions appear on the dashboard trade section while they are active."
            href="/home/dashboard"
            action="Open dashboard"
          />
          <DestinationCard
            icon={History}
            title="Closed trades"
            body="Closed cTrader deals are imported into journal history for review and analytics."
            href="/home/journal"
            action="Open journal"
          />
          <DestinationCard
            icon={BarChart3}
            title="Analytics"
            body="Imported outcomes feed account stats, performance summaries, and behavior review."
            href="/home/analytics"
            action="Open analytics"
          />
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Card className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <WalletCards size={17} />
                  Linked accounts
                </div>
                <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                  Broker access
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
              {connections.length ? (
                connections.map((connection) => (
                  <ConnectionRow
                    key={connection.id}
                    connection={connection}
                  />
                ))
              ) : (
                <BrokerEmptyState
                  title="No broker linked yet"
                  body="Connect cTrader to let JUVO import broker activity without giving trade execution access."
                />
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <Database size={17} />
              Sync rules
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <RuleItem
                title="Open positions"
                body="Kept separate from journal trades until cTrader reports the position as closed."
              />
              <RuleItem
                title="Final P/L"
                body="Realized P/L comes from cTrader close/deal data, not from JUVO's live quote display."
              />
              <RuleItem
                title="User notes"
                body="Imported broker records do not replace your journal notes, screenshots, or reviews."
              />
              <RuleItem
                title="Manual sync"
                body="Use Sync broker when you want to reconcile after reconnecting or testing broker data."
              />
            </div>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {brokerOptions.map((broker) => (
            <Card key={broker.id} className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                {broker.action === "ctrader" && connectedCTrader ? (
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
                  {connectedCTrader ? "Manage connection" : "Connect cTrader"}
                </Button>
              ) : (
                <Button variant="ghost" className="mt-5" disabled>
                  Coming soon
                </Button>
              )}
            </Card>
          ))}
        </section>

        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
              Broker connections are the data pipe. Journals, live trades, and
              performance review live in their own workspaces.
            </p>
            <Link href="/home/accounts/trading" className="shrink-0">
              <Button variant="ghost">Manage trading accounts</Button>
            </Link>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}

function StatusMetric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: IconType;
  label: string;
  value: string;
  tone: "good" | "bad" | "muted";
}) {
  const toneClass =
    tone === "good"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : tone === "bad"
        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
        : "bg-slate-500/10 text-slate-600 dark:text-slate-300";

  return (
    <div className="min-w-0 rounded-xl bg-slate-100 px-4 py-3 dark:bg-white/[0.05]">
      <div className="flex items-center gap-2">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${toneClass}`}>
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
            {value}
          </p>
          <p className="mt-0.5 truncate text-xs font-semibold text-slate-500 dark:text-slate-400">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

function PermissionItem({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2.5 dark:bg-white/[0.05]">
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
          checked
            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
        }`}
      >
        {checked ? <CheckCircle2 size={15} /> : <Unplug size={15} />}
      </span>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </p>
    </div>
  );
}

function DestinationCard({
  icon: Icon,
  title,
  body,
  href,
  action,
}: {
  icon: IconType;
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <Card className="p-6">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
        <Icon size={20} />
      </div>
      <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {body}
      </p>
      <Link href={href} className="mt-5 inline-flex">
        <Button variant="ghost">{action}</Button>
      </Link>
    </Card>
  );
}

function ConnectionRow({ connection }: { connection: BrokerConnection }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-950 dark:text-white">
            {connection.provider === "ctrader" ? "cTrader" : "MetaAPI"}
          </p>
          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
            {connection.brokerName ||
              connection.accountNumber ||
              connection.externalAccountId ||
              "Linked broker account"}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[connection.status]}`}
        >
          {statusCopy[connection.status]}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <ConnectionMini
          label="Type"
          value={connection.accountType ? connection.accountType : "Unknown"}
        />
        <ConnectionMini
          label="Connected"
          value={
            connection.connectedAt
              ? formatDate(connection.connectedAt, {
                  month: "short",
                  day: "numeric",
                })
              : "Pending"
          }
        />
      </div>
    </div>
  );
}

function ConnectionMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-100 px-3 py-2 dark:bg-white/[0.05]">
      <p className="truncate font-bold capitalize text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 truncate text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}

function RuleItem({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
      <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
        {body}
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
