"use client";

import Sidebar from "@/components/ui/Sidebar";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";

type DashboardShellProps = {
  children: React.ReactNode;
};

const titles: Record<string, string> = {
  "/home/dashboard": "Dashboard",
  "/home/journal": "Journal",
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
  "/home/general/settings": "Settings",
  "/home/general/help": "Help",
};

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const title = useMemo(() => {
    const match = Object.keys(titles)
      .sort((a, b) => b.length - a.length)
      .find((path) => pathname === path || pathname.startsWith(`${path}/`));
    return titles[match || ""] || "JUVO";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-background dark:text-white">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="flex min-h-screen">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="min-w-0 flex-1">
          <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/85 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-background/80 lg:hidden">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                JUVO
              </p>
              <h1 className="text-lg font-bold">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle compact />
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white"
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
