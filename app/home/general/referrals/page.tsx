"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { useAuthStore } from "@/stores/auth.store";
import { Gift } from "lucide-react";
import { useMemo, useState } from "react";

export default function ReferralsPage() {
  const user = useAuthStore((state) => state.user);
  const [copied, setCopied] = useState(false);
  const code = useMemo(() => {
    const seed = (user?.email || user?.fullName || "juvo").replace(/[^a-z0-9]/gi, "").slice(0, 8);
    return `JUVO-${seed.toUpperCase() || "TRADER"}`;
  }, [user]);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          eyebrow="General"
          title="Referrals"
          description="Invite traders who actually want a journal, not a signal group."
        />
        <Card className="p-6">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Gift size={22} />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-950 dark:text-white">
            Your invite code
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Share this with a trader who needs process more than predictions.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <code className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-950 dark:bg-white/10 dark:text-white">
              {code}
            </code>
            <Button onClick={copy}>{copied ? "Copied" : "Copy code"}</Button>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
