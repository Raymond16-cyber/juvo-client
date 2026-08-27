"use client";

import { useAuthStore } from "@/stores/auth.store";
import {
  BadgeDollarSign,
  BarChart3,
  Bot,
  CalendarDays,
  CircleHelp,
  CreditCard,
  FileDown,
  Gauge,
  Gift,
  LineChart,
  Link2,
  Settings,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/home/dashboard", icon: Gauge },
      { name: "Journal", href: "/home/journal", icon: LineChart },
      { name: "Juvo Calendar", href: "/home/calendar", icon: CalendarDays },
      { name: "Analytics", href: "/home/analytics", icon: BarChart3 },
      { name: "Behavioural Insights", href: "/home/insights", icon: Sparkles },
      { name: "Juvo AI", href: "/home/ai/chat", icon: Bot },
      { name: "Growth", href: "/home/growth", icon: Target },
    ],
  },
  {
    label: "Accounts",
    items: [
      { name: "Trading Accounts", href: "/home/accounts/trading", icon: BadgeDollarSign },
      { name: "Broker Connections", href: "/home/accounts/broker", icon: Link2 },
      { name: "Export Data", href: "/home/accounts/export", icon: FileDown },
    ],
  },
  {
    label: "General",
    items: [
      { name: "Referrals", href: "/home/general/referrals", icon: Gift },
      { name: "Subscriptions", href: "/home/general/subscriptions", icon: CreditCard },
      { name: "Settings", href: "/home/general/settings", icon: Settings },
      { name: "Help Center", href: "/home/general/help", icon: CircleHelp },
    ],
  },
];

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 transform flex-col border-r border-slate-200 bg-white px-4 py-5 text-slate-700 shadow-2xl shadow-slate-200/60 transition-transform duration-300 dark:border-white/10 dark:bg-[#070b14] dark:text-slate-200 dark:shadow-black/40 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-8 flex items-center justify-between">
        <Link href="/home/dashboard" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-lg font-bold text-primary dark:bg-white dark:text-slate-950">
            J
          </span>
          <div>
            <h2 className="text-2xl font-bold tracking-wide text-slate-950 dark:text-white">
              JUVO
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Trading OS
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-300/50 dark:bg-primary dark:text-slate-950 dark:shadow-primary/20"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/20 text-primary dark:bg-primary/15">
            <UserRound size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
              { user?.fullName || "Trader"}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              { user?.email || "trader@juvo.com" }
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
