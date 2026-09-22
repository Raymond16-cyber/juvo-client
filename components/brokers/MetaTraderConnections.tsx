"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Link2, LoaderCircle, RefreshCw, ShieldCheck, Unplug } from "lucide-react";
import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate } from "@/lib/format";
import { brokerStatusCopy, brokerStatusStyle } from "@/lib/broker-status";
import { createMetaTraderConnection, getMetaTraderCapabilities, getMetaTraderConfigurationLink, manageMetaTraderConnection } from "@/services/broker.service";
import { useBrokerStore } from "@/stores/broker.store";
import { BrokerConnection } from "@/types/broker.types";

export default function MetaTraderConnections() {
  const connections = useBrokerStore((state) => state.connections);
  const fetchConnections = useBrokerStore((state) => state.fetchConnections);
  const upsertConnection = useBrokerStore((state) => state.upsertConnection);
  const meta = connections.filter((item) => item.provider === "metaapi");
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<"mt4" | "mt5">("mt5");
  const [server, setServer] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestKey = useRef<string | null>(null);
  const hasAccounts = meta.length > 0;
  const pending = meta.some((item) => !["connected", "disconnected", "error", "broker_auth_failed"].includes(item.status));

  useEffect(() => {
    let disposed = false;
    void getMetaTraderCapabilities().then((result) => { if (!disposed) setEnabled(result.enabled); })
      .catch((cause) => { if (!disposed) setError(getApiErrorMessage(cause, "Unable to check MetaTrader availability.")); });
    return () => { disposed = true; };
  }, []);

  useEffect(() => {
    if (!hasAccounts || !enabled) return;
    let running = false;
    const poll = async () => {
      if (running || document.visibilityState !== "visible") return;
      running = true;
      try { await fetchConnections(true); } catch { /* Retain the last known state while offline. */ }
      finally { running = false; }
    };
    const timer = setInterval(() => { void poll(); }, pending ? 5000 : 30000);
    document.addEventListener("visibilitychange", poll);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", poll); };
  }, [enabled, fetchConnections, hasAccounts, pending]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    if (busy || !enabled) return;
    setBusy("create"); setError(null);
    try {
      requestKey.current ||= crypto.randomUUID();
      upsertConnection(await createMetaTraderConnection({ platform, server: server.trim(), requestKey: requestKey.current }));
      setServer(""); requestKey.current = null;
    } catch (cause) { setError(getApiErrorMessage(cause, "Unable to start MetaTrader setup.")); }
    finally { setBusy(null); }
  }

  async function secureSetup(connection: BrokerConnection) {
    const popup = window.open("about:blank", "_blank");
    if (!popup) { setError("Allow pop-ups for JUVO to open secure MetaApi setup."); return; }
    popup.opener = null;
    setBusy(connection.id); setError(null);
    try { popup.location.replace(await getMetaTraderConfigurationLink(connection.id)); }
    catch (cause) { popup.close(); setError(getApiErrorMessage(cause, "Unable to open secure setup.")); }
    finally { setBusy(null); }
  }

  async function manage(connection: BrokerConnection, action: "sync" | "reconnect" | "disconnect") {
    if (action === "disconnect" && !window.confirm("Disconnect MetaTrader and undeploy its MetaApi resource? Live sync stops; your trades and journals stay saved.")) return;
    setBusy(connection.id); setError(null);
    try {
      upsertConnection(await manageMetaTraderConnection(connection.id, action));
      if (action === "disconnect") await useBrokerStore.getState().fetchPositions("open").catch(() => undefined);
    } catch (cause) { setError(getApiErrorMessage(cause, "Unable to update this MetaTrader connection.")); }
    finally { setBusy(null); }
  }

  return (
    <section aria-labelledby="metatrader-heading" className="border-y border-slate-200 py-6 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="metatrader-heading" className="text-lg font-bold text-slate-950 dark:text-white">MetaTrader</h2>
        <span className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><ShieldCheck size={15} />Read-only access</span>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>}
      {enabled === null && !error && <p className="mt-3 text-sm text-slate-500">Checking availability...</p>}
      {enabled === false && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">MetaTrader connectivity has not been enabled by the JUVO administrator.</p>}
      {enabled && (
        <form onSubmit={create} className="mt-5 flex flex-wrap items-end gap-4">
          <fieldset disabled={!!busy}>
            <legend className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">Platform</legend>
            <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-white/20">
              {(["mt4", "mt5"] as const).map((value) => <label key={value} className={`cursor-pointer px-4 py-2.5 text-sm font-semibold ${platform === value ? "bg-primary/15 text-cyan-800 dark:text-primary" : "text-slate-600 dark:text-slate-300"}`}>
                <input type="radio" name="meta-platform" value={value} checked={platform === value} onChange={() => { setPlatform(value); requestKey.current = null; }} className="sr-only peer" />
                <span className="peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary">{value.toUpperCase()}</span>
              </label>)}
            </div>
          </fieldset>
          <label className="min-w-0 grow basis-60 text-xs font-semibold text-slate-600 dark:text-slate-300">
            Broker server
            <input required maxLength={128} value={server} disabled={!!busy} autoComplete="off" placeholder="Exact server name" onChange={(event) => { setServer(event.target.value); requestKey.current = null; }} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-950 outline-none focus:border-primary dark:border-white/20 dark:bg-zinc-900 dark:text-white" />
          </label>
          <Button type="submit" disabled={!!busy || !server.trim()}>{busy === "create" ? <LoaderCircle size={16} className="animate-spin" /> : <Link2 size={16} />}Connect MetaTrader</Button>
        </form>
      )}
      {enabled && <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">Enter credentials directly through MetaApi. For read-only access, use your MetaTrader investor password where supported.</p>}
      <div className="mt-5 divide-y divide-slate-200 dark:divide-white/10">
        {meta.map((connection) => (
          <div key={connection.id} className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-sm font-bold text-slate-950 dark:text-white">MetaTrader {connection.platform === "mt4" ? "4" : "5"}</h3>
                <span role="status" className={`rounded px-2 py-1 text-xs font-semibold ${brokerStatusStyle(connection.status)}`}>{brokerStatusCopy[connection.status]}</span>
              </div>
              <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-300">{connection.server} {connection.accountNumber && ` / ${connection.accountNumber}`} {connection.accountCurrency && ` / ${connection.accountCurrency}`}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{connection.lastSyncedAt ? `Last synced ${formatDate(connection.lastSyncedAt, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : "Not synced yet"}</p>
              {connection.lastError && <p className="mt-2 max-w-xl text-sm text-amber-700 dark:text-amber-300">{connection.lastError.message}</p>}
              {connection.investorMode === false && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">Investor access is not enabled. JUVO still never places, edits, or closes trades.</p>}
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {busy === connection.id && <LoaderCircle aria-label="Updating connection" size={17} className="animate-spin text-slate-400" />}
              {connection.desiredConnected && ["awaiting_configuration", "broker_auth_failed", "error", "reconnecting"].includes(connection.status) && <Button variant="ghost" disabled={!!busy || !enabled} onClick={() => void secureSetup(connection)}><ExternalLink size={16} />Continue securely</Button>}
              {connection.desiredConnected && ["connected", "error", "broker_auth_failed", "reconnecting"].includes(connection.status) && <button type="button" title="Sync broker" aria-label="Sync MetaTrader broker" disabled={!!busy || !enabled} onClick={() => void manage(connection, "sync")} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-300 text-slate-600 disabled:opacity-40 dark:border-white/20 dark:text-slate-300"><RefreshCw size={17} /></button>}
              {connection.status === "disconnected" && <Button variant="ghost" disabled={!!busy || !enabled} onClick={() => void manage(connection, "reconnect")}><Link2 size={16} />Reconnect</Button>}
              {connection.desiredConnected && <button type="button" title="Disconnect MetaTrader" aria-label="Disconnect MetaTrader" disabled={!!busy || !enabled} onClick={() => void manage(connection, "disconnect")} className="grid h-10 w-10 place-items-center rounded-lg border border-rose-200 text-rose-600 disabled:opacity-40 dark:border-rose-500/30 dark:text-rose-300"><Unplug size={17} /></button>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
