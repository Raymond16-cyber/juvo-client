"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { brokerDebug } from "@/services/broker.service";
import { useBrokerStore } from "@/stores/broker.store";
import { useNoticeStore } from "@/stores/notice.store";
import { BrokerConnection } from "@/types/broker.types";
import { CheckCircle2, Link2, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
};

export default function BrokerConnectionsPage() {
  const router = useRouter();
  const showNotice = useNoticeStore((state) => state.showNotice);
  const startCTraderConnect = useBrokerStore(
    (state) => state.startCTraderConnect,
  );
  const completeCTraderConnect = useBrokerStore(
    (state) => state.completeCTraderConnect,
  );
  const fetchConnections = useBrokerStore((state) => state.fetchConnections);
  const connections = useBrokerStore((state) => state.connections);
  const isConnecting = useBrokerStore((state) => state.isConnecting);
  const error = useBrokerStore((state) => state.error);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const errorParam = params.get("error");
    const code = params.get("code");

    brokerDebug("page:query", {
      connected,
      error: errorParam,
      hasCode: Boolean(code),
      codeLength: code?.length || 0,
    });

    async function hydrateBrokerPage() {
      if (connected === "1") {
        showNotice({
          title: "cTrader connected",
          body: "Your cTrader account is linked. Juvo can now import fills into the journal.",
          tone: "success",
        });
        await fetchConnections().catch(() => undefined);
        router.replace("/home/accounts/broker");
        return;
      }

      if (errorParam) {
        showNotice({
          title: "cTrader connection failed",
          body: errorParam,
          tone: "warning",
        });
        await fetchConnections().catch(() => undefined);
        router.replace("/home/accounts/broker");
        return;
      }

      if (code) {
        brokerDebug("page:exchanging-code");
        try {
          await completeCTraderConnect(code);
          showNotice({
            title: "cTrader connected",
            body: "Your cTrader account is linked. Juvo can now import fills into the journal.",
            tone: "success",
          });
        } catch (completeError) {
          brokerDebug("page:exchange-failed", completeError);
        }
        router.replace("/home/accounts/broker");
        return;
      }

      await fetchConnections().catch(() => undefined);
    }

    void hydrateBrokerPage();
  }, [completeCTraderConnect, fetchConnections, router, showNotice]);

  const handleConnectCtrader = async () => {
    brokerDebug("page:connect-clicked");
    await startCTraderConnect();
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
            Until live sync ships, create the account manually and journal each
            execution.
          </p>
          <Link href="/home/accounts/trading" className="mt-4 inline-block">
            <Button>Add trading account</Button>
          </Link>
        </Card>
      </div>
    </DashboardShell>
  );
}
