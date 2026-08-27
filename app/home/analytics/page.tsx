import BehavioralInsights from "@/components/dashboard/BehavioralInsights";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import TradingGoals from "@/components/dashboard/TradingGoals";

export default function AnalyticsPage() {
  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Analytics
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-white">
            Performance Review
          </h1>
        </div>
        <PerformanceChart />
        <div className="grid gap-6 lg:grid-cols-2">
          <TradingGoals />
          <BehavioralInsights />
        </div>
      </div>
    </DashboardShell>
  );
}
