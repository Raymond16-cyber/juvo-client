import DashboardShell from "@/components/dashboard/DashboardShell";
import JuvoAIInsight from "@/components/dashboard/JuvoAIInsight";

export default function JuvoAIChatPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl">
        <JuvoAIInsight />
      </div>
    </DashboardShell>
  );
}
