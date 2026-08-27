"use client";

import { animateAiAnalysis } from "@/animations/ai";
import { Bot, BrainCircuit } from "lucide-react";
import { useEffect, useRef } from "react";

const insights = [
  "Your risk stayed consistent across the last four logged trades.",
  "Most losing entries happened after the first high-confidence setup of the day.",
  "London session notes show stronger plan adherence than New York session notes.",
];

export default function JuvoAIInsight() {
  const aiRef = useRef<HTMLElement>(null);

  useEffect(() => {
    return animateAiAnalysis(aiRef.current);
  }, []);

  return (
    <section
      ref={aiRef}
      data-dashboard-card
      className="dashboard-card rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Juvo AI
          </p>
          <h2 className="mt-1 text-xl font-bold text-slate-950 dark:text-white">
            Analyzing your recent trades
          </h2>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <BrainCircuit size={21} />
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
        <Bot size={17} />
        <span>Reading patterns</span>
        <span className="flex gap-1" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              data-ai-dot
              className="h-1.5 w-1.5 rounded-full bg-primary"
            />
          ))}
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {insights.map((insight) => (
          <div
            key={insight}
            data-ai-insight
            className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300"
          >
            {insight}
          </div>
        ))}
      </div>
    </section>
  );
}

