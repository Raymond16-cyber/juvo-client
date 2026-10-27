"use client";

import { animateProgressGroup } from "@/animations/analytics";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import AnimatedProgress from "@/components/ui/AnimatedProgress";
import { AnalyticsInsight } from "@/types/analytics.types";
import { Brain, ShieldAlert, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";

const fallback = [
  {
    icon: Brain,
    title: "Journal first",
    body: "Juvo learns from your notes, not from a signal feed. Log a session to unlock behaviour review.",
    score: 0,
  },
];

const iconMap = {
  psychology: Brain,
  risk: ShieldAlert,
  session: TrendingUp,
  edge: TrendingUp,
  discipline: ShieldAlert,
};

type BehavioralInsightsProps = {
  insights?: AnalyticsInsight[];
};

export default function BehavioralInsights({ insights = [] }: BehavioralInsightsProps) {
  const insightsRef = useRef<HTMLElement>(null);
  const items = insights.length
    ? insights.slice(0, 3).map((insight) => ({
        ...insight,
        icon: iconMap[insight.category as keyof typeof iconMap] || Brain,
      }))
    : fallback;

  useEffect(() => {
    return animateProgressGroup(insightsRef.current);
  }, [items.length]);

  return (
    <section
      ref={insightsRef}
      data-dashboard-card
      className="dashboard-card rounded-2xl border border-slate-200/90 bg-white p-4 dark:border-white/10 dark:bg-card sm:p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        Behaviour
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
        Actionable insights
      </h2>
      {!insights.length ? (
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Guidance below is general until you complete enough journaled sessions for personalised notes.
        </p>
      ) : null}

      <div className="mt-6 space-y-4">
        {items.map((insight) => {
          const Icon = insight.icon;

          return (
            <div
              key={insight.title}
              data-insight-card
              data-progress-item
              className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                <Icon size={17} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-950 dark:text-white">
                  {insight.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {insight.body}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <AnimatedProgress value={insight.score || 0} />
                  </div>
                  <span className="w-10 text-right text-xs font-bold text-slate-600 dark:text-slate-300">
                    <AnimatedCounter
                      value={insight.score || 0}
                      formatter={(value) => `${Math.round(value)}%`}
                      duration={720}
                    />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
