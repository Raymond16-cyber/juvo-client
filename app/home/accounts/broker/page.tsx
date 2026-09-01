import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { Link2 } from "lucide-react";
import Link from "next/link";

const brokers = [
  {
    name: "MetaTrader 5",
    body: "Manual journal stays first. Direct MT5 sync will import history without replacing your notes.",
  },
  {
    name: "cTrader",
    body: "Keep executions honest. Connection will map fills to the journal you already started.",
  },
  {
    name: "CSV / broker statement",
    body: "Upload statements later. For now, log the trade while the decision is still warm.",
  },
];

export default function BrokerConnectionsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Accounts"
          title="Broker Connections"
          description="Juvo is a journal, not a copy-trader. Broker sync is for importing fills — you still write the psychology."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {brokers.map((broker) => (
            <Card key={broker.name} className="p-6">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Link2 size={20} />
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
                {broker.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {broker.body}
              </p>
              <Button variant="ghost" className="mt-5" disabled>
                Sync coming next
              </Button>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Until live sync ships, create the account manually and journal each execution.
          </p>
          <Link href="/home/accounts/trading" className="mt-4 inline-block">
            <Button>Add trading account</Button>
          </Link>
        </Card>
      </div>
    </DashboardShell>
  );
}
