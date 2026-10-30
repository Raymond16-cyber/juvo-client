"use client";

import JuvoNoticeHost from "@/components/ui/JuvoNotice";
import Sidebar from "@/components/ui/Sidebar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { pageTransition, panelTransition, motionDuration } from "@/lib/motion";
import {
  pageShellClassName,
  pageShellFillClassName,
} from "@/lib/responsive";
import { AnimatePresence, motion } from "framer-motion";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type DashboardShellProps = {
  children: React.ReactNode;
  fillViewport?: boolean;
};

const titles: Record<string, string> = {
  "/home/dashboard": "Dashboard",
  "/home/journal": "Journal",
  "/home/charts": "Charts",
  "/home/calendar": "Calendar",
  "/home/analytics": "Analytics",
  "/home/insights": "Insights",
  "/home/ai/chat": "Juvo AI",
  "/home/growth": "Growth",
  "/home/accounts/trading": "Accounts",
  "/home/accounts/broker": "Brokers",
  "/home/accounts/export": "Export",
  "/home/general/referrals": "Referrals",
  "/home/general/subscriptions": "Plans",
  "/home/general/achievements": "Achievements",
  "/home/general/settings": "Settings",
  "/home/general/help": "Help",
  "/home/general/juvo-tutorials": "JUVO Tutorials",
};

const SIDEBAR_COLLAPSED_KEY = "juvo.sidebarCollapsed";

export default function DashboardShell({
  children,
  fillViewport = false,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  });
  const pathname = usePathname();

  useEffect(() => {
    queueMicrotask(() => setSidebarOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!fillViewport) return;

    const html = document.documentElement;
    const { overflow: htmlOverflow } = html.style;
    const { overflow: bodyOverflow } = document.body.style;
    html.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      html.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [fillViewport]);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      }
      return next;
    });
  };

  const title = useMemo(() => {
    const match = Object.keys(titles)
      .sort((a, b) => b.length - a.length)
      .find((path) => pathname === path || pathname.startsWith(`${path}/`));
    return titles[match || ""] || "JUVO";
  }, [pathname]);

  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [sidebarOpen]);

  return (
    <div
      className={`bg-slate-50 text-slate-950 dark:bg-background dark:text-white ${
        fillViewport ? "h-dvh overflow-hidden" : "min-h-screen"
      }`}
    >
      <AnimatePresence>
        {sidebarOpen ? (
          <motion.button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionDuration.fast }}
          />
        ) : null}
      </AnimatePresence>

      <div
        className={`flex ${fillViewport ? "h-full overflow-hidden" : "min-h-screen"}`}
      >
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={toggleSidebarCollapsed}
        />

        <main
          className={`min-w-0 flex-1 ${
            fillViewport ? "flex h-full min-h-0 flex-col overflow-hidden" : ""
          }`}
        >
          <div className="juvo-safe-pt sticky top-0 z-30 flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/90 bg-white/90 px-3 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-background/85 sm:px-4 lg:hidden mt-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                JUVO
              </p>
              <h1 className="truncate text-base font-bold tracking-tight sm:text-lg">
                {title}
              </h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ThemeToggle compact />
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
                aria-label="Open sidebar"
                aria-expanded={sidebarOpen}
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          <div
            className={
              fillViewport ? pageShellFillClassName : pageShellClassName
            }
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                className={
                  fillViewport
                    ? "flex min-h-0 min-w-0 flex-1 flex-col"
                    : "min-w-0"
                }
                variants={pageTransition}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={panelTransition}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <JuvoNoticeHost />
    </div>
  );
}
