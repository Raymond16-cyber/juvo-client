"use client";

import JournalSearch from "@/components/dashboard/JournalSearch";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { getSelectedAccount, isAccountInPlay } from "@/lib/account";
import { useAccountsStore } from "@/stores/accounts.store";
import { useAuthStore } from "@/stores/auth.store";
import { useJournalStore } from "@/stores/journal.store";
import { Bell, CalendarDays, Flame, Plus, Rocket } from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useMemo } from "react";

type DashboardHeaderProps = {
  onOpenMyDay?: (hasJournalToday?: boolean) => void;
  accountSwitcher?: ReactNode;
};

export default function DashboardHeader({
  onOpenMyDay,
}: DashboardHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const accounts = useAccountsStore((state) => state.accounts);
  const selectedAccountId = useAccountsStore((state) => state.selectedAccountId);
  const selectedAccount = getSelectedAccount(accounts, selectedAccountId);
  const journalStatus = useJournalStore((state) => state.journalStatus);
  const isLoadingJournalStatus = useJournalStore((state) => state.isLoading);
  const getTodayJournalStatus = useJournalStore(
    (state) => state.getTodayJournalStatus,
  );
  const canTrade = isAccountInPlay(selectedAccount);

  const streak =
    journalStatus?.streak?.currentStreak ??
    user?.stats?.currentJournalStreak ??
    0;

  const journalTimeZone = journalStatus?.timeZone;
  const dateLabel = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: journalTimeZone || undefined,
      }).format(new Date());
    } catch {
      return new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date());
    }
  }, [journalTimeZone]);

  const primaryJournalLabel = !canTrade
    ? "New Account"
    : journalStatus?.hasJournalToday
      ? "Log Trade"
      : "Start My Day";

  useEffect(() => {
    getTodayJournalStatus().catch(() => undefined);
  }, [getTodayJournalStatus]);

  const handleGetTodayJournalStatus = async () => {
    if (!canTrade) {
      onOpenMyDay?.(false);
      return;
    }
    try {
      const response = await getTodayJournalStatus();
      onOpenMyDay?.(response.data.hasJournalToday);
    } catch {
      onOpenMyDay?.(false);
    }
  };

  return (
    <header className="mb-5 hidden items-end justify-between gap-4 lg:mb-6 lg:flex">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Welcome back, {user?.fullName || "Trader"}
          <span className="mx-2 text-slate-300 dark:text-slate-600">·</span>
          <span>{dateLabel}</span>
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
            Trading Dashboard
          </h1>
          {streak > 0 ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-orange-500/15 to-amber-400/15 px-3 py-1 text-xs font-bold text-orange-700 dark:text-orange-300">
              <Flame size={13} className="fill-orange-500/30" aria-hidden />
              <span>{streak}-day streak</span>
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <JournalSearch />
        <Link
          href="/home/calendar"
          className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Open calendar"
        >
          <CalendarDays size={18} />
        </Link>
        <Link
          href="/home/general/help"
          className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10"
          aria-label="Help"
        >
          <Bell size={18} />
        </Link>
        <ThemeToggle compact />
        <Button
          className="h-11 shrink-0 whitespace-nowrap px-5"
          onClick={handleGetTodayJournalStatus}
          disabled={isLoadingJournalStatus}
        >
          {journalStatus?.hasJournalToday ? (
            <Plus size={18} />
          ) : (
            <Rocket size={18} />
          )}
          {isLoadingJournalStatus ? "Checking..." : primaryJournalLabel}
        </Button>
      </div>
    </header>
  );
}
