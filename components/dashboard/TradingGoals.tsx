"use client";

import { animateProgressGroup } from "@/animations/analytics";
import AnimatedProgress from "@/components/ui/AnimatedProgress";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { Goal } from "@/types/goal.types";
import Link from "next/link";
import { useEffect, useRef } from "react";

type TradingGoalsProps = {
  goals?: Goal[];
};

export default function TradingGoals({ goals = [] }: TradingGoalsProps) {
  const goalsRef = useRef<HTMLElement>(null);
  const visible = goals.slice(0, 3);

  useEffect(() => {
    return animateProgressGroup(goalsRef.current);
  }, [visible.length]);

  return (
    <section
      ref={goalsRef}
      data-dashboard-card
      className="dashboard-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Growth
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            Trading Goals
          </h2>
        </div>
        <Link href="/home/growth" className="text-sm font-bold text-primary">
          Manage
        </Link>
      </div>

      <div className="mt-6 space-y-6">
        {visible.length ? (
          visible.map((goal) => {
            const progress = goal.targetValue
              ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
              : 0;

            return (
              <div key={goal._id} data-progress-item>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {goal.title}
                  </span>
                  <span className="font-bold text-slate-950 dark:text-white">
                    <AnimatedCounter
                      value={progress}
                      formatter={(value) => `${Math.round(value)}%`}
                      duration={700}
                    />
                  </span>
                </div>
                <div className="mt-3 h-2.5 rounded-full bg-slate-100 dark:bg-white/10">
                  <AnimatedProgress value={progress} />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set process goals — risk cap, journal streak, A+ setups only — instead of P/L targets.
          </p>
        )}
      </div>
    </section>
  );
}
