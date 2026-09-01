"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { formatDate, formatMoney } from "@/lib/format";
import { useJournalStore } from "@/stores/journal.store";
import { FileDown } from "lucide-react";
import { useEffect } from "react";

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ExportPage() {
  const journals = useJournalStore((state) => state.journals);
  const getUserJournals = useJournalStore((state) => state.getUserJournals);

  useEffect(() => {
    getUserJournals().catch(() => undefined);
  }, [getUserJournals]);

  const exportJson = () => {
    download(
      "juvo-journals.json",
      JSON.stringify(journals, null, 2),
      "application/json",
    );
  };

  const exportCsv = () => {
    const rows = [
      ["Date", "Status", "Trades", "Open", "Closed", "P/L", "Note"].join(","),
      ...journals.map((journal) =>
        [
          formatDate(journal.journalDate),
          journal.status,
          journal.tradesCount || 0,
          journal.openTrades,
          journal.closedTrades,
          journal.totalProfitLoss,
          `"${(journal.psychology?.beforeTrading || "").replace(/"/g, "'")}"`,
        ].join(","),
      ),
    ];
    download("juvo-journals.csv", rows.join("\n"), "text/csv");
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Accounts"
          title="Export Data"
          description="Your journal belongs to you. Download JSON for backup or CSV for a spreadsheet review."
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6">
            <FileDown className="text-primary" />
            <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
              JSON backup
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Full journals, trades, and notes. {journals.length} sessions ready.
            </p>
            <Button className="mt-5" onClick={exportJson} disabled={!journals.length}>
              Download JSON
            </Button>
          </Card>
          <Card className="p-6">
            <FileDown className="text-primary" />
            <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
              CSV report
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              One row per journal day with P/L and pre-market notes.
            </p>
            <Button className="mt-5" onClick={exportCsv} disabled={!journals.length}>
              Download CSV
            </Button>
          </Card>
        </div>
        {journals[0] ? (
          <Card className="p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Latest session {formatDate(journals[0].journalDate)} ·{" "}
              {formatMoney(journals[0].totalProfitLoss || 0)}
            </p>
          </Card>
        ) : null}
      </div>
    </DashboardShell>
  );
}
