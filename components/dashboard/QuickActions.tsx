import Button from "@/components/ui/Button";
import { useJournalStore } from "@/stores/journal.store";
import { Bot, FileDown, Link2, Plus, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

type QuickActionsProps = {
  onOpenMyDay?: (hasJournalToday?: boolean) => void;
};

export default function QuickActions({ onOpenMyDay }: QuickActionsProps) {
  const router = useRouter();
  const journalStatus = useJournalStore((state) => state.journalStatus);
  const isLoadingJournalStatus = useJournalStore((state) => state.isLoading);
  const getTodayJournalStatus = useJournalStore(
    (state) => state.getTodayJournalStatus,
  );
  const primaryJournalLabel = journalStatus?.hasJournalToday
    ? "Add Trade"
    : "Start My Day";
  const PrimaryIcon = journalStatus?.hasJournalToday ? Plus : Rocket;
  const actions = [
    {
      label: isLoadingJournalStatus ? "Checking..." : primaryJournalLabel,
      icon: PrimaryIcon,
      onClick: async () => {
        try {
          const response = await getTodayJournalStatus();
          onOpenMyDay?.(response.data.hasJournalToday);
        } catch {
          onOpenMyDay?.(false);
        }
      },
      disabled: isLoadingJournalStatus,
    },
    {
      label: "Ask Juvo AI",
      icon: Bot,
      onClick: () => router.push("/home/ai/chat"),
    },
    {
      label: "Connect broker",
      icon: Link2,
      onClick: () => router.push("/home/accounts/broker"),
    },
    {
      label: "Export report",
      icon: FileDown,
      onClick: () => router.push("/home/accounts/export"),
    },
  ];

  return (
    <section
      data-dashboard-card
      className="dashboard-card rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-card"
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Shortcuts
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
        Quick Actions
      </h2>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.label}
              variant={index === 0 ? "primary" : "ghost"}
              onClick={action.onClick}
              disabled={action.disabled}
              className="w-full justify-start whitespace-nowrap"
            >
              <Icon size={18} />
              {action.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
