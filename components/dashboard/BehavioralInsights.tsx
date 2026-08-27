"use client";

import { animateProgressGroup } from "@/animations/analytics";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import AnimatedProgress from "@/components/ui/AnimatedProgress";
import { Brain, ShieldAlert, TrendingUp } from "lucide-react";
import { useEffect, useRef } from "react";

const insights = [
  {
    icon: Brain,
    title: "Best trading window",
    body: "Your highest quality trades came between 9:30 AM and 11:00 AM.",
    score: 78,
  },
  {
    icon: ShieldAlert,
    title: "Risk warning",
    body: "Losses increased after two consecutive wins. Keep position size fixed.",
    score: 52,
  },
  {
    icon: TrendingUp,
    title: "Edge improving",
    body: "Breakout retest setups are producing a 72% win rate this month.",
    score: 72,
  },
];

export default function BehavioralInsights() {
  const insightsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    return animateProgressGroup(insightsRef.current);
  }, []);

  return (
    <section
      ref={insightsRef}
      data-dashboard-card
      className="dashboard-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card"
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Behavioural Insights
      </p>
      <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
        Juvo AI Notes
      </h2>

      <div className="mt-6 space-y-4">
        {insights.map((insight) => {
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
                    <AnimatedProgress value={insight.score} />
                  </div>
                  <span className="w-10 text-right text-xs font-bold text-slate-600 dark:text-slate-300">
                    <AnimatedCounter
                      value={insight.score}
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
