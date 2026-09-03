"use client";

import JuvoChart from "@/charts/tradingViewCahrt";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";

export default function ChartsPage() {
  return (
    <DashboardShell fillViewport>
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <PageHeader
          eyebrow="Workspace"
          title="Juvo Charts"
          description="Read price action inside Juvo. Keep your journal, risk, and market in one workspace."
        />
        <div className="min-h-0 flex-1 overflow-hidden">
          <JuvoChart />
        </div>
      </div>
    </DashboardShell>
  );
}
