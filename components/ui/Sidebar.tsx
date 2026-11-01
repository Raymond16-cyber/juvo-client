"use client";

import AccountSwitcher from "@/components/dashboard/AccountSwitcher";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { panelTransition } from "@/lib/motion";
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
  Trophy,
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
  width?: number;
  onClose?: () => void;
  onToggleCollapse?: () => void;
  onResize?: (width: number) => void;
};

const navigationGroups = [
  {
    label: "Workspace",
    items: [
      { name: "Dashboard", href: "/home/dashboard", icon: Gauge, color: "text-cyan-500" },
      { name: "Journal", href: "/home/journal", icon: LineChart, color: "text-violet-500" },
      { name: "Charts", href: "/home/charts", icon: CandlestickChart, color: "text-amber-500" },
      { name: "Juvo Calendar", href: "/home/calendar", icon: CalendarDays, color: "text-rose-500" },
      { name: "Analytics", href: "/home/analytics", icon: BarChart3, color: "text-emerald-500" },
      { name: "Behavioural Insights", href: "/home/insights", icon: Sparkles, color: "text-fuchsia-500" },
      { name: "Juvo AI", href: "/home/ai/chat", icon: Bot, color: "text-sky-500" },
      { name: "Growth", href: "/home/growth", icon: Target, color: "text-orange-500" },
    ],
  },
  {
    label: "Accounts",
    items: [
      { name: "Trading Accounts", href: "/home/accounts/trading", icon: BadgeDollarSign, color: "text-emerald-500" },
      { name: "Broker Connections", href: "/home/accounts/broker", icon: Link2, color: "text-blue-500" },
      { name: "Export Data", href: "/home/accounts/export", icon: FileDown, color: "text-indigo-500" },
    ],
  },
  {
    label: "General",
    items: [
      { name: "Referrals", href: "/home/general/referrals", icon: Gift, color: "text-pink-500" },
      { name: "Subscriptions", href: "/home/general/subscriptions", icon: CreditCard, color: "text-yellow-500" },
      { name: "Achievements", href: "/home/general/achievements", icon: Trophy, color: "text-amber-500" },
      { name: "Settings", href: "/home/general/settings", icon: Settings, color: "text-slate-500" },
      { name: "Help Center", href: "/home/general/help", icon: CircleHelp, color: "text-teal-500" },
    ],
  },
];

const Sidebar = ({
  isOpen = false,
  isCollapsed = false,
  width = 288,
  onClose,
  onToggleCollapse,
  onResize,
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
      style={{ "--sidebar-width": `${width}px` } as React.CSSProperties}
      className={`fixed inset-y-0 left-0 z-50 flex w-[min(18rem,calc(100vw-2.5rem))] max-w-full shrink-0 transform flex-col border-r border-slate-200/90 bg-white/95 px-3 py-4 text-slate-700 backdrop-blur-xl transition-[transform,width] duration-300 juvo-safe-pt juvo-safe-pb dark:border-white/10 dark:bg-[#070b14]/95 dark:text-slate-200 sm:w-72 sm:py-5 lg:sticky lg:top-0 lg:h-screen lg:max-w-none lg:translate-x-0 ${
        isCollapsed
          ? "lg:w-20 lg:px-2.5"
          : "lg:w-[var(--sidebar-width)]"
      } ${
        isOpen ? "translate-x-0 shadow-2xl shadow-slate-300/40 dark:shadow-black/50" : "-translate-x-full"
      }`}
    >
      <div className={`flex items-center justify-between ${isCollapsed ? "mb-10 lg:flex-col lg:gap-4" : "mb-8"}`}>
        <Link
          href="/home/dashboard"
          className={`flex min-w-0 items-center gap-3 mt-3 ${isCollapsed ? "lg:justify-center" : ""}`}
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

      <nav
        className={`flex-1 overflow-y-auto ${
          isCollapsed ? "space-y-9 pr-0" : "space-y-7 pr-1"
        }`}
      >
        {navigationGroups.map((group) => (
          <div key={group.label}>
            <p
              className={`mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500 ${
                isCollapsed ? "lg:sr-only" : ""
              }`}
            >
              {group.label}
            </p>
            <div className={isCollapsed ? "space-y-2" : "space-y-1"}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    title={isCollapsed ? item.name : undefined}
                    className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      isCollapsed ? "lg:h-11 lg:justify-center lg:px-0 lg:py-0" : ""
                    } ${
                      isActive
                        ? "bg-slate-950/95 text-white dark:bg-primary/15 dark:text-primary"
                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    }`}
                  >
                    {isActive ? (
                      <motion.span
                        layoutId="sidebar-active-rail"
                        className="pointer-events-none absolute bottom-2 left-0 top-2 w-1 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    ) : null}
                    <Icon
                      size={18}
                      className={`relative z-10 shrink-0 ${
                        isActive ? "text-primary dark:text-primary" : item.color
                      }`}
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

      <div className={`mt-6 ${isCollapsed ? "space-y-4" : "space-y-3"}`}>
        <div className={isCollapsed ? "lg:hidden" : ""}>
          <AccountSwitcher />
        </div>
        <ThemeToggle compact={isCollapsed} />
        <div
          className={`rounded-3xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] ${
            isCollapsed ? "p-2" : "p-3"
          }`}
        >
          <div className={`flex items-center gap-3 ${isCollapsed ? "lg:justify-center" : ""}`}>
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
      {!isCollapsed ? (
        <div
          role="separator"
          aria-label="Resize sidebar"
          aria-orientation="vertical"
          tabIndex={0}
          onPointerDown={(event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            const startX = event.clientX;
            const startWidth = width;
            const handlePointerMove = (moveEvent: PointerEvent) => {
              onResize?.(startWidth + moveEvent.clientX - startX);
            };
            const handlePointerUp = () => {
              window.removeEventListener("pointermove", handlePointerMove);
              window.removeEventListener("pointerup", handlePointerUp);
            };
            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", handlePointerUp, { once: true });
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              onResize?.(width - 16);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              onResize?.(width + 16);
            }
          }}
          className="absolute inset-y-0 right-0 hidden w-1 cursor-col-resize touch-none bg-transparent transition-colors hover:bg-primary/60 focus:bg-primary/60 focus:outline-none lg:block"
        />
      ) : null}
    </motion.aside>
  );
};

export default Sidebar;
