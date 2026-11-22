"use client";

import { cn } from "@/lib/ui";
import { interactionTransition } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  CalendarDays,
  Coffee,
  Download,
  FilePlus2,
  Gauge,
  HelpCircle,
  LineChart,
  Link2,
  Search,
  Settings,
  Target,
  Trophy,
  WalletCards,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type CommandItem = {
  id: string;
  label: string;
  href: string;
  keywords?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  group: string;
};

const COMMANDS: CommandItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/home/dashboard",
    icon: Gauge,
    group: "Workspace",
    keywords: "home overview",
  },
  {
    id: "journal",
    label: "Journal",
    href: "/home/journal",
    icon: LineChart,
    group: "Workspace",
    keywords: "trades diary log",
  },
  {
    id: "log-trade",
    label: "Log trade / Start my day",
    href: "/home/dashboard?action=myday",
    icon: FilePlus2,
    group: "Actions",
    keywords: "open day journal trade",
  },
  {
    id: "no-trade",
    label: "Record no-trade day",
    href: "/home/dashboard?action=no-trade",
    icon: Coffee,
    group: "Actions",
    keywords: "discipline skip",
  },
  {
    id: "calendar",
    label: "Calendar",
    href: "/home/calendar",
    icon: CalendarDays,
    group: "Workspace",
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/home/analytics",
    icon: BarChart3,
    group: "Workspace",
    keywords: "performance pnl chart",
  },
  {
    id: "ai",
    label: "Juvo AI",
    href: "/home/ai/chat",
    icon: Bot,
    group: "Workspace",
    keywords: "chat coach",
  },
  {
    id: "growth",
    label: "Growth",
    href: "/home/growth",
    icon: Target,
    group: "Workspace",
    keywords: "goals",
  },
  {
    id: "accounts",
    label: "Trading Accounts",
    href: "/home/accounts/trading",
    icon: WalletCards,
    group: "Accounts",
  },
  {
    id: "broker",
    label: "Connect broker",
    href: "/home/accounts/broker",
    icon: Link2,
    group: "Accounts",
    keywords: "mt5 ctrader",
  },
  {
    id: "export",
    label: "Export report",
    href: "/home/accounts/export",
    icon: Download,
    group: "Accounts",
    keywords: "csv pdf download",
  },
  {
    id: "achievements",
    label: "Achievements",
    href: "/home/general/achievements",
    icon: Trophy,
    group: "General",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/home/general/settings",
    icon: Settings,
    group: "General",
    keywords: "profile preferences",
  },
  {
    id: "help",
    label: "Help & tutorials",
    href: "/home/general/help",
    icon: HelpCircle,
    group: "General",
    keywords: "support docs",
  },
];

export default function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
        return;
      }
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setOpen(true);
        return;
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((item) =>
      `${item.label} ${item.keywords || ""} ${item.group}`
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const run = (item: CommandItem) => {
    setOpen(false);
    router.push(item.href);
  };

  const groups = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filtered.forEach((item) => {
      const list = map.get(item.group) || [];
      list.push(item);
      map.set(item.group, list);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-slate-950/45 px-4 pt-[12vh] backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={interactionTransition(0.16)}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={interactionTransition(0.18)}
            className="w-full max-w-lg overflow-hidden rounded-card border border-border bg-card shadow-juvo"
          >
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search size={16} className="text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setActive((current) =>
                      Math.min(filtered.length - 1, current + 1),
                    );
                  }
                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    setActive((current) => Math.max(0, current - 1));
                  }
                  if (event.key === "Enter" && filtered[active]) {
                    event.preventDefault();
                    run(filtered[active]);
                  }
                }}
                placeholder="Search pages and actions…"
                className="h-12 w-full bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400 dark:text-white"
              />
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 sm:inline">
                Esc
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {filtered.length ? (
                groups.map(([group, items]) => (
                  <div key={group} className="mb-2 last:mb-0">
                    <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {group}
                    </p>
                    {items.map((item) => {
                      const Icon = item.icon;
                      const index = filtered.findIndex(
                        (entry) => entry.id === item.id,
                      );
                      const selected = index === active;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onMouseEnter={() => setActive(index)}
                          onClick={() => run(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm transition",
                            selected
                              ? "bg-slate-950 text-white dark:bg-primary dark:text-slate-950"
                              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.06]",
                          )}
                        >
                          <Icon size={16} className="shrink-0" />
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              ) : (
                <p className="px-3 py-8 text-center text-sm text-slate-500">
                  No matches
                </p>
              )}
            </div>
            <div className="border-t border-border px-3 py-2 text-[11px] text-slate-400">
              Navigate with ↑ ↓ · Open with Enter · Toggle with Ctrl/⌘ K or /
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
