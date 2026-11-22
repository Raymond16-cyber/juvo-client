"use client";

import Button from "@/components/ui/Button";
import SlideToConfirm from "@/components/ui/SlideToConfirm";
import { useJournalStore } from "@/stores/journal.store";
import { Bot, Coffee, FileDown, Link2 } from "lucide-react";
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
  const noTradeLogged =
    journalStatus?.journalingStatus === "no_trade_day" ||
    (journalStatus?.noTradeDay && !journalStatus.noTradeDay.supersededByTrade);

  const openMyDay = async () => {
    try {
      const response = await getTodayJournalStatus();
      onOpenMyDay?.(response.data.hasJournalToday);
    } catch {
      onOpenMyDay?.(false);
    }
  };

  const actions = [
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
      className="dashboard-card rounded-card border border-border bg-card p-3.5 sm:p-4"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Next
      </p>
      <h2 className="mt-0.5 text-base font-semibold text-slate-950 dark:text-white">
        Quick actions
      </h2>

      <div className="mt-3 space-y-2">
        <SlideToConfirm
          label={`Slide to ${primaryJournalLabel.toLowerCase()}`}
          confirmLabel={`Opening ${primaryJournalLabel}…`}
          onConfirm={openMyDay}
          disabled={isLoadingJournalStatus}
        />

        <div className="grid grid-cols-1 gap-1.5">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Button
                key={action.label}
                variant="ghost"
                onClick={action.onClick}
                disabled={action.disabled}
                className="h-9 w-full justify-start px-3 text-sm"
              >
                <Icon size={15} className="shrink-0" />
                <span className="truncate">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
