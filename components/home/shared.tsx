"use client";

import { cn } from "@/lib/ui";
import {
  BarChart3,
  CalendarDays,
  Gauge,
  LineChart,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

export const homeEase = [0.22, 1, 0.36, 1] as const;

export function HomeSection({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative", className)}>
      <div className="mx-auto max-w-7xl px-4 py-20 lg:py-28">{children}</div>
    </section>
  );
}

export function SectionIntro({
  kicker,
  title,
  description,
  align = "left",
  action,
}: {
  kicker: string;
  title: React.ReactNode;
  description: string;
  align?: "left" | "center";
  action?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between",
        align === "center" && "lg:flex-col lg:items-center lg:text-center",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/80">
          {kicker}
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const chromeNav = [
  { id: "dashboard", label: "Dashboard", icon: Gauge },
  { id: "journal", label: "Journal", icon: LineChart },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "insights", label: "Insights", icon: Sparkles },
];

export function AppChrome({
  active,
  title,
  children,
}: {
  active: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#070b14] shadow-[0_28px_80px_rgba(2,6,23,0.55)]">
      <div className="flex items-center gap-3 border-b border-white/8 px-3 py-2.5 sm:px-4">
        <div className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          JUVO · {title}
        </p>
      </div>

      <div className="grid sm:grid-cols-[8rem_minmax(0,1fr)] lg:grid-cols-[9.5rem_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/8 p-2.5 sm:block">
          {chromeNav.map((item) => {
            const Icon = item.icon;
            const on = item.id === active;

            return (
              <div
                key={item.id}
                className={cn(
                  "mb-1 flex items-center gap-2 rounded-xl px-2.5 py-2 text-[11px] font-medium transition-colors",
                  on ? "bg-primary/15 text-primary" : "text-slate-500",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>
            );
          })}
        </aside>

        <div className="min-w-0 bg-[#050816]/50 p-3 sm:p-4">{children}</div>
      </div>
    </div>
  );
}

export function useAutoCycle(
  length: number,
  intervalMs: number,
  enabled: boolean,
) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!enabled || length < 2) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [enabled, intervalMs, length]);

  return [index, setIndex] as const;
}
