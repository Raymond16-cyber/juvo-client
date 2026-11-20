"use client";

import { useEffect, useState } from "react";
import {
  Copy,
  Download,
  Link2,
  LoaderCircle,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Unplug,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/axios";
import {
  brokerStatusCopy,
  brokerStatusStyle,
  metaTraderDesktopGuidance,
  metaTraderStatusGuidance,
} from "@/lib/broker-status";
import { formatDate } from "@/lib/format";
import { touchTargetClassName } from "@/lib/responsive";
import { cn } from "@/lib/ui";
import {
  createMetaTraderPairingCode,
  downloadMetaTraderConnector,
  getMetaTraderStatus,
  manageMetaTraderConnection,
} from "@/services/broker.service";
import { useBrokerStore } from "@/stores/broker.store";
import { BrokerConnection, MetaTraderStatus } from "@/types/broker.types";

const setupSteps = [
  {
    title: "Download",
    body: "Save JUVO Connector into MQL5 / Experts, open it in MetaEditor, and compile with F7.",
  },
  {
    title: "Allow WebRequest",
    body: "In MT5 Options → Expert Advisors, allow WebRequest for the server address below.",
  },
  {
    title: "Attach EA",
    body: "Attach JUVO Connector to a separate chart and set ApiUrl plus PairingCode.",
  },
  {
    title: "Pair",
    body: "Generate a pairing code here, paste it into the EA inputs, and confirm the account links.",
  },
  {
    title: "Keep desktop online",
    body: "Leave MT5 and the EA running so mobile and same-account trades keep syncing into Juvo.",
  },
] as const;

export default function MetaTraderConnections() {
  const connections = useBrokerStore((state) => state.connections);
  const fetchConnections = useBrokerStore((state) => state.fetchConnections);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [apiUrl, setApiUrl] = useState("");
  const [guidance, setGuidance] = useState(metaTraderDesktopGuidance);
  const [pair, setPair] = useState<{ code: string; expiresAt: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const meta = connections.filter((item) => item.provider === "metatrader");
  const mt5Connections = meta.filter((item) => item.platform !== "mt4");
  const legacyMt4 = meta.filter((item) => item.platform === "mt4");

  useEffect(() => {
    let disposed = false;
    void getMetaTraderStatus()
      .then((result: MetaTraderStatus) => {
        if (disposed) return;
        setEnabled(result.enabled);
        setApiUrl(result.url);
        if (result.guidance) {
          setGuidance({
            desktopOnline: result.guidance.desktopOnline || metaTraderDesktopGuidance.desktopOnline,
            offlineCatchUp: result.guidance.offlineCatchUp || metaTraderDesktopGuidance.offlineCatchUp,
          });
        }
      })
      .catch((cause) => {
        if (!disposed) setError(getApiErrorMessage(cause, "Unable to check connector availability."));
      });
    let running = false;
    const poll = async () => {
      if (running || document.visibilityState !== "visible") return;
      running = true;
      try {
        await fetchConnections(true);
      } catch {
        /* Preserve the last known connection state. */
      } finally {
        running = false;
      }
    };
    const timer = setInterval(() => {
      void poll();
    }, 5000);
    document.addEventListener("visibilitychange", poll);
    return () => {
      disposed = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [fetchConnections]);

  useEffect(() => {
    if (!pair) return;
    const timer = setTimeout(
      () => setPair(null),
      Math.max(0, new Date(pair.expiresAt).getTime() - Date.now()),
    );
    return () => clearTimeout(timer);
  }, [pair]);

  async function run(key: string, action: () => Promise<void>) {
    if (busy) return;
    setBusy(key);
    setError(null);
    setNotice("");
    try {
      await action();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to complete this connector request."));
    } finally {
      setBusy(null);
    }
  }

  async function manage(connection: BrokerConnection, action: "sync" | "disconnect") {
    if (
      action === "disconnect" &&
      !window.confirm(
        "Disconnect this MT5 account? Its connector credential will be revoked. Saved trades and journals will remain.",
      )
    ) {
      return;
    }
    await run(connection.id, async () => {
      await manageMetaTraderConnection(connection.id, action);
      await fetchConnections(true);
      if (action === "disconnect") await useBrokerStore.getState().fetchPositions("open");
      setNotice(
        action === "sync"
          ? "Sync requested. Keep MT5 and JUVO Connector running."
          : "Disconnected. Generate a new code to pair this account again.",
      );
    });
  }

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Copied to clipboard.");
    } catch {
      setError("Clipboard unavailable. Select and copy the value manually.");
    }
  }

  const iconClass = cn(
    touchTargetClassName,
    "shrink-0 rounded-lg border border-slate-300 text-slate-600 disabled:opacity-40 dark:border-white/20 dark:text-slate-300",
  );
  const date = (value: string) =>
    formatDate(value, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

  return (
    <section aria-labelledby="metatrader-heading" className="border-y border-slate-200 py-6 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="metatrader-heading" className="text-lg font-bold text-slate-950 dark:text-white">
            MetaTrader
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Structured desktop connector sync for MetaTrader accounts.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck size={15} />
          Read-only connector
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">MetaTrader 5</h3>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Live
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Pair a desktop MT5 terminal with JUVO Connector for account-wide trades, positions, and balances.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">MetaTrader 4</h3>
            <span className="rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Coming soon
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            MT4 pairing is not available yet. Do not use the MT5 connector or MQ5 EA against an MT4 terminal.
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-3 rounded-2xl border border-cyan-500/25 bg-cyan-500/5 p-4">
        <MonitorSmartphone className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700 dark:text-cyan-300" />
        <div className="min-w-0 space-y-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
          <p>{guidance.desktopOnline}</p>
          <p className="text-slate-600 dark:text-slate-400">{guidance.offlineCatchUp}</p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-3 text-sm text-cyan-800 dark:text-cyan-300">
          {notice}
        </p>
      )}
      {enabled === null && !error && (
        <p className="mt-3 text-sm text-slate-500">Checking availability...</p>
      )}
      {enabled === false && (
        <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
          The administrator needs to configure the MT5 connector before pairing is available.
        </p>
      )}

      {enabled && (
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-950 dark:text-white">Setup steps</h3>
            <ol className="mt-3 space-y-3">
              {setupSteps.map((step, index) => (
                <li key={step.title} className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-slate-300 text-xs font-semibold text-slate-700 dark:border-white/20 dark:text-slate-200">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950 dark:text-white">{step.title}</p>
                    <p className="mt-0.5">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-4">
              <Button
                variant="ghost"
                disabled={!!busy}
                onClick={() => void run("download", downloadMetaTraderConnector)}
              >
                <Download size={16} />
                Download MT5 connector
              </Button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Use one connector per account and terminal. Manual trades and trades from other EAs are included.
            </p>
          </div>

          <div className="min-w-0 border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 dark:border-white/10">
            <label
              className="text-xs font-semibold text-slate-600 dark:text-slate-300"
              htmlFor="mt5-api-url"
            >
              Server address / ApiUrl
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="mt5-api-url"
                readOnly
                value={apiUrl}
                className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-950 dark:border-white/20 dark:text-white"
              />
              <button
                className={iconClass}
                title="Copy server address"
                aria-label="Copy server address"
                onClick={() => void copy(apiUrl)}
              >
                <Copy size={16} />
              </button>
            </div>
            {apiUrl.startsWith("http://") && (
              <p className="mt-2 text-xs leading-5 text-amber-700 dark:text-amber-300">
                Local development: set AllowLocalHttp to true in the EA inputs. Use HTTPS outside this computer.
              </p>
            )}
            <div className="mt-5">
              <Button
                disabled={!!busy}
                onClick={() =>
                  void run("pair", async () => {
                    const result = await createMetaTraderPairingCode();
                    setPair(result);
                    setApiUrl(result.apiUrl);
                  })
                }
              >
                {busy === "pair" ? (
                  <LoaderCircle size={16} className="animate-spin" />
                ) : (
                  <Link2 size={16} />
                )}
                {pair ? "Replace pairing code" : "Generate pairing code"}
              </Button>
            </div>
            {pair && (
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <code className="break-all text-lg font-semibold text-slate-950 dark:text-white">
                    {pair.code}
                  </code>
                  <button
                    className={iconClass}
                    title="Copy pairing code"
                    aria-label="Copy pairing code"
                    onClick={() => void copy(pair.code)}
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Expires {date(pair.expiresAt)}. Keep this code private; it links one trading account.
                </p>
              </div>
            )}
            <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
              Closing MT5 pauses updates. Available history is reconciled on reconnect. Disconnecting below
              revokes access without deleting your journal.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold text-slate-950 dark:text-white">MT5 connections</h3>
        {mt5Connections.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400">No MT5 accounts paired yet.</p>
        )}
        <div className="divide-y divide-slate-200 dark:divide-white/10">
          {mt5Connections.map((connection) => {
            const guidanceText = metaTraderStatusGuidance(connection.status, connection.statusReason);
            return (
              <div
                key={connection.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white">
                      {connection.brokerName || "MetaTrader"} 5
                    </h4>
                    <span
                      role="status"
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${brokerStatusStyle(connection.status)}`}
                    >
                      {brokerStatusCopy[connection.status]}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-300">
                    {[connection.server, connection.accountNumber, connection.accountCurrency]
                      .filter(Boolean)
                      .join(" / ")}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {connection.lastHeartbeatAt
                      ? `Last heartbeat ${date(connection.lastHeartbeatAt)}`
                      : "Awaiting terminal heartbeat"}{" "}
                    /{" "}
                    {connection.lastSyncedAt
                      ? `History synced ${date(connection.lastSyncedAt)}`
                      : "History not synced yet"}
                  </p>
                  {guidanceText && (
                    <p className="mt-2 max-w-xl text-sm text-amber-700 dark:text-amber-300">{guidanceText}</p>
                  )}
                  {connection.legacy && (
                    <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                      Previous connection retired. Saved history is preserved. Pair an MT5 terminal above to
                      resume syncing.
                    </p>
                  )}
                  {connection.lastError && (
                    <p className="mt-2 max-w-xl text-sm text-amber-700 dark:text-amber-300">
                      {connection.lastError.message}
                    </p>
                  )}
                </div>
                {connection.desiredConnected && (
                  <div className="flex shrink-0 items-center gap-2">
                    {busy === connection.id && (
                      <LoaderCircle
                        aria-label="Updating connection"
                        size={17}
                        className="animate-spin text-slate-400"
                      />
                    )}
                    <button
                      title="Request broker sync"
                      aria-label="Request MT5 broker sync"
                      disabled={!!busy || !enabled}
                      className={iconClass}
                      onClick={() => void manage(connection, "sync")}
                    >
                      <RefreshCw size={17} />
                    </button>
                    <button
                      title="Disconnect MT5 account"
                      aria-label="Disconnect MT5 account"
                      disabled={!!busy}
                      className={iconClass}
                      onClick={() => void manage(connection, "disconnect")}
                    >
                      <Unplug size={17} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {legacyMt4.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-800 dark:text-amber-200">
            Older MT4-linked records are shown as legacy history only. Pair MT5 above to resume live syncing.
          </div>
        )}
      </div>
    </section>
  );
}
