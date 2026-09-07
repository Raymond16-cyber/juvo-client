"use client";

import AccountSwitcher from "@/components/dashboard/AccountSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { juvoEase, panelTransition } from "@/lib/motion";
import { useAuthStore } from "@/stores/auth.store";
import {
  BadgeDollarSign,
  BarChart3,
  Bot,
  CalendarDays,
  CandlestickChart,
  CircleHelp,
  CreditCard,
  FileDown,
  Gauge,
  Gift,
  LineChart,
  Link2,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Target,
  UserRound,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

type SidebarProps = {
  isOpen?: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
};

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/home/dashboard", icon: Gauge },
      { name: "Journal", href: "/home/journal", icon: LineChart },
      { name: "Charts", href: "/home/charts", icon: CandlestickChart },
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

const Sidebar = ({
  isOpen = false,
  isCollapsed = false,
  onClose,
  onToggleCollapse,
}: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  return (
    <motion.aside
      layout
      transition={panelTransition}
      className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 transform flex-col border-r border-slate-200 bg-white px-4 py-5 text-slate-700 shadow-2xl shadow-slate-200/60 transition-[transform,width] duration-300 dark:border-white/10 dark:bg-[#070b14] dark:text-slate-200 dark:shadow-black/40 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none ${
        isCollapsed ? "lg:w-20 lg:px-3" : "lg:w-72"
      } ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/home/dashboard"
          className={`flex min-w-0 items-center gap-3 ${isCollapsed ? "lg:justify-center" : ""}`}
          onClick={onClose}
          title="JUVO"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-lg font-bold text-primary dark:bg-white dark:text-slate-950">
            J
          </span>
          <div className={`min-w-0 ${isCollapsed ? "lg:hidden" : ""}`}>
            <h2 className="text-2xl font-bold tracking-wide text-slate-950 dark:text-white">
              JUVO
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Trading OS
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 lg:grid"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-7 overflow-y-auto pr-1">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p
              className={`mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 ${
                isCollapsed ? "lg:sr-only" : ""
              }`}
            >
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
                    onClick={onClose}
                    title={isCollapsed ? item.name : undefined}
                    className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                      isCollapsed ? "lg:justify-center lg:px-2.5" : ""
                    } ${
                      isActive
                        ? "bg-slate-950 text-white shadow-lg shadow-slate-300/50 dark:bg-primary dark:text-slate-950 dark:shadow-primary/20"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="sidebar-active-item"
                        className="absolute inset-0 rounded-2xl bg-slate-950 dark:bg-primary"
                        transition={{ duration: 0.2, ease: juvoEase }}
                      />
                    ) : null}
                    <Icon
                      size={18}
                      className="relative z-10 shrink-0 transition-transform group-hover:-translate-y-0.5"
                    />
                    <span className={`relative z-10 truncate ${isCollapsed ? "lg:hidden" : ""}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-6 space-y-3">
        <div className={isCollapsed ? "lg:hidden" : ""}>
          <AccountSwitcher />
        </div>
        <ThemeToggle compact={isCollapsed} />
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/20 text-primary dark:bg-primary/15">
              <UserRound size={20} />
            </div>
            <div className={`min-w-0 flex-1 ${isCollapsed ? "lg:hidden" : ""}`}>
              <p className="truncate text-sm font-bold text-slate-950 dark:text-white">
                {user?.fullName || "Trader"}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email || "trader@juvo.com"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className={`grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-rose-500 dark:hover:bg-white/10 ${
                isCollapsed ? "lg:hidden" : ""
              }`}
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
