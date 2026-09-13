"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { getApiErrorMessage } from "@/lib/axios";
import { formatMoney } from "@/lib/format";
import { accountId, buildJournalCsv, filterExportJournals, journalDateKey } from "@/lib/journal-export";
import { controlClassName } from "@/lib/ui";
import { getJournalExportService } from "@/services/journal.service";
import type { JournalExport } from "@/types/journal.types";
import { AlertCircle, Download, FileJson, LoaderCircle, RotateCcw, Table2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function ExportPage() {
  const [snapshot, setSnapshot] = useState<JournalExport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ accountId: "", from: "", to: "" });
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const request = ++requestId.current;
    try {
      const data = await getJournalExportService();
      if (request === requestId.current) setSnapshot(data);
    } catch (loadError) {
      if (request === requestId.current) setError(getApiErrorMessage(loadError, "Unable to load export data."));
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) void load(); });
    return () => { active = false; requestId.current += 1; };
  }, [load]);

  const accounts = useMemo(() => {
    const entries = new Map<string, string>();
    for (const journal of snapshot?.journals || []) {
      for (const account of [journal.tradingAccount, ...(journal.trades || []).map((trade) => trade.tradingAccount)]) {
        const id = accountId(account);
        if (id) entries.set(id, typeof account === "object" ? account.accountName : id);
      }
    }
    return Array.from(entries, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [snapshot]);

  const invalidRange = Boolean(filters.from && filters.to && filters.from > filters.to);
  const journals = useMemo(() => snapshot && !invalidRange
    ? filterExportJournals(snapshot.journals, filters, snapshot.timeZone)
    : [], [snapshot, filters, invalidRange]);
  const tradeCount = journals.reduce((total, journal) => total + (journal.trades?.length || 0), 0);
  const missingRates = journals.reduce((total, journal) => total + (journal.conversionUnavailableCount || 0), 0);
  const pnl = journals.reduce((total, journal) => total + (journal.totalProfitLossReporting ?? 0), 0);
  const canDownload = !loading && !error && !invalidRange && journals.length > 0;
  const timeZone = snapshot?.timeZone || "UTC";
  const currency = snapshot?.reportingCurrency || "USD";

  const exportData = (format: "json" | "journals" | "trades") => {
    if (!canDownload || !snapshot) return;
    const suffix = `${filters.from || "all"}_${filters.to || "time"}`;
    if (format === "json") {
      download(`juvo-journals-${suffix}.json`, JSON.stringify({
        ...snapshot, snapshotAt: snapshot.exportedAt, exportedAt: new Date().toISOString(), filters, journals,
      }, null, 2), "application/json;charset=utf-8");
    } else {
      download(`juvo-${format}-${suffix}.csv`, buildJournalCsv(journals, timeZone, format), "text/csv;charset=utf-8");
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader eyebrow="Accounts" title="Export Data" actions={
          <Button variant="ghost" onClick={() => { setLoading(true); setError(null); void load(); }} disabled={loading} aria-label="Refresh export data" title="Refresh export data">
            {loading ? <LoaderCircle size={18} className="animate-spin" /> : <RotateCcw size={18} />}
          </Button>
        } />

        <div className="grid gap-4 border-y border-slate-200 py-5 dark:border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <label className="space-y-2 text-sm font-medium">
            <span>Account</span>
            <select className={controlClassName} value={filters.accountId} onChange={(event) => setFilters({ ...filters, accountId: event.target.value })}>
              <option value="">All accounts</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>From</span>
            <input type="date" className={controlClassName} value={filters.from} max={filters.to || undefined} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
          </label>
          <label className="space-y-2 text-sm font-medium">
            <span>To</span>
            <input type="date" className={controlClassName} value={filters.to} min={filters.from || undefined} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
          </label>
          <div className="flex items-end">
            <Button variant="ghost" onClick={() => setFilters({ accountId: "", from: "", to: "" })} disabled={!filters.accountId && !filters.from && !filters.to}>
              <RotateCcw size={16} /> Reset filters
            </Button>
          </div>
        </div>

        {error || invalidRange ? <p role="alert" className="text-sm text-rose-600 dark:text-rose-300">{invalidRange ? "From date must be on or before the to date." : error}</p> : null}
        {missingRates > 0 ? <p role="status" className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle size={18} className="shrink-0" /> {missingRates} trade{missingRates === 1 ? " is" : "s are"} missing FX rates. Reporting totals are incomplete; native P/L is included in the trade report.
        </p> : null}

        <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3" aria-busy={loading}>
          {[{ label: "Journal sessions", value: journals.length }, { label: "Trades", value: tradeCount }, { label: `Net P/L (${currency})`, value: missingRates ? "Unavailable" : formatMoney(pnl, currency) }].map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-sm text-slate-500 dark:text-slate-400">{item.label}</dt>
              <dd className="mt-1 break-words text-2xl font-semibold">{loading && !snapshot ? "..." : item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="grid gap-4 md:grid-cols-3">
          {([
            { key: "json", title: "Journal JSON", count: `${journals.length} sessions`, icon: FileJson },
            { key: "journals", title: "Session CSV", count: `${journals.length} rows`, icon: Table2 },
            { key: "trades", title: "Trade CSV", count: `${tradeCount} rows`, icon: Table2 },
          ] as const).map((item) => (
            <section key={item.key} className="flex min-w-0 flex-col items-start rounded-lg border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-card">
              <item.icon size={22} className="text-primary" />
              <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.count}</p>
              <Button className="mt-5" onClick={() => exportData(item.key)} disabled={!canDownload || (item.key === "trades" && !tradeCount)} aria-label={`Download ${item.title}`}>
                <Download size={16} /> Download
              </Button>
            </section>
          ))}
        </div>

        <section>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-lg font-semibold">Session preview</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">{timeZone} | {Math.min(8, journals.length)} of {journals.length} sessions</span>
          </div>
          {!journals.length ? <p className="border-t border-slate-200 py-8 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400" role="status">{loading ? "Loading journals..." : error ? "Export data is unavailable." : "No journals match these filters."}</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-400"><tr>
                  <th scope="col" className="px-2 py-3">Date</th><th scope="col" className="px-2 py-3">Status</th><th scope="col" className="px-2 py-3 text-right">Trades</th><th scope="col" className="px-2 py-3 text-right">P/L ({currency})</th>
                </tr></thead>
                <tbody>{journals.slice(0, 8).map((journal) => <tr key={journal._id} className="border-b border-slate-200 dark:border-white/10">
                  <td className="whitespace-nowrap px-2 py-3">{journalDateKey(journal.journalDate, timeZone)}</td>
                  <td className="px-2 py-3">{journal.status}</td><td className="px-2 py-3 text-right">{journal.trades?.length || 0}</td>
                  <td className="whitespace-nowrap px-2 py-3 text-right">{journal.conversionUnavailableCount ? "Unavailable" : formatMoney(journal.totalProfitLossReporting ?? 0, currency)}</td>
                </tr>)}</tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardShell>
  );
}
