"use client";

import { cn } from "@/lib/ui";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { openCommandPalette } from "@/components/ui/CommandPalette";

type CommandPaletteTriggerProps = {
  className?: string;
  /** Compact icon-only control for tight headers. */
  compact?: boolean;
};

export default function CommandPaletteTrigger({
  className,
  compact = false,
}: CommandPaletteTriggerProps) {
  const [shortcut, setShortcut] = useState("Ctrl K");

  useEffect(() => {
    const mac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);
    setShortcut(mac ? "⌘K" : "Ctrl K");
  }, []);

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => openCommandPalette()}
        className={cn(
          "grid h-10 w-10 place-items-center rounded-control border border-border bg-card text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white",
          className,
        )}
        aria-label={`Open command palette (${shortcut})`}
        title={`Search pages and actions (${shortcut})`}
      >
        <Search size={18} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => openCommandPalette()}
      className={cn(
        "inline-flex h-10 min-w-0 items-center gap-2 rounded-control border border-border bg-card px-3 text-left text-sm text-slate-500 transition hover:border-primary/40 hover:bg-slate-50 hover:text-slate-950 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white",
        className,
      )}
      aria-label={`Open command palette (${shortcut})`}
    >
      <Search size={16} className="shrink-0 text-slate-400" />
      <span className="min-w-0 flex-1 truncate font-medium">
        Search pages and actions…
      </span>
      <kbd className="hidden shrink-0 items-center rounded border border-border bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline-flex dark:bg-white/[0.04] dark:text-slate-300">
        {shortcut}
      </kbd>
    </button>
  );
}
