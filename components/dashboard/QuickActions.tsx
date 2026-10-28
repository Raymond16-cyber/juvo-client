import Button from "@/components/ui/Button";
import { useJournalStore } from "@/stores/journal.store";
import { Bot, Coffee, FileDown, Link2, Plus, Rocket } from "lucide-react";
import { useRouter } from "next/navigation";

type QuickActionsProps = {
  onOpenMyDay?: (hasJournalToday?: boolean) => void;
  onOpenNoTradeDay?: () => void;
};

export default function QuickActions({
  onOpenMyDay,
  onOpenNoTradeDay,
}: QuickActionsProps) {
  const router = useRouter();
  const journalStatus = useJournalStore((state) => state.journalStatus);
  const isLoadingJournalStatus = useJournalStore((state) => state.isLoading);
  const getTodayJournalStatus = useJournalStore(
    (state) => state.getTodayJournalStatus,
  );
  const primaryJournalLabel = journalStatus?.hasJournalToday
    ? "Log Trade"
    : "Start My Day";
  const PrimaryIcon = journalStatus?.hasJournalToday ? Plus : Rocket;
  const noTradeLogged =
    journalStatus?.journalingStatus === "no_trade_day" ||
    (journalStatus?.noTradeDay && !journalStatus.noTradeDay.supersededByTrade);
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
      label: noTradeLogged ? "View no-trade day" : "No Trade Today",
      icon: Coffee,
      onClick: () => onOpenNoTradeDay?.(),
      disabled: !onOpenNoTradeDay,
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
      className="dashboard-card rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-white/10 dark:bg-card sm:p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        Next
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
        Quick actions
      </h2>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.label}
              variant={index === 0 ? "primary" : "ghost"}
              onClick={action.onClick}
              disabled={action.disabled}
              className="h-11 w-full justify-start whitespace-normal sm:whitespace-nowrap"
            >
              <Icon size={17} />
              {action.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}
