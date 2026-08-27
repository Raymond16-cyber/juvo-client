import DashboardShell from "@/components/dashboard/DashboardShell";
import MyDayWorkflow from "@/components/dashboard/MyDayWorkflow";

export default function JournalPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-2xl">
        <MyDayWorkflow />
      </div>
    </DashboardShell>
  );
}
