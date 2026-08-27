import BehavioralInsights from "@/components/dashboard/BehavioralInsights";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default function InsightsPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Behavioural Insights
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
            Trading Behavior Review
          </h1>
        </div>
        <BehavioralInsights />
      </div>
    </DashboardShell>
  );
}
