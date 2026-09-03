"use client";

import { cn } from "@/lib/ui";
import { motion, useReducedMotion } from "framer-motion";
import CountUp from "react-countup";
import { useState } from "react";
import {
  HomeSection,
  SectionIntro,
  homeEase,
  useAutoCycle,
} from "./shared";

const chapters = [
  {
    when: "Month 1",
    title: "You start writing it down",
    body: "The journal feels slow. You do it anyway. Most of the value is noticing how often you ‘just knew’ — and were wrong.",
    discipline: 41,
    revenge: 6,
    plan: 4,
  },
  {
    when: "Month 3",
    title: "The leak gets a name",
    body: "Gold after a stop. NY size. Skipped notes on Fridays. You can point at it instead of calling the week ‘unlucky’.",
    discipline: 63,
    revenge: 3,
    plan: 6,
  },
  {
    when: "Month 6",
    title: "Fewer trades. Same account.",
    body: "The plan is shorter. Two attempts, then you’re done. P/L is noisier than the calendar — the calendar is the honest one.",
    discipline: 78,
    revenge: 1,
    plan: 8,
  },
  {
    when: "Month 12",
    title: "The journal is boring. That’s the point.",
    body: "No new system. A year of sessions you can actually read. Discipline is the score you keep when the equity curve is quiet.",
    discipline: 86,
    revenge: 0,
    plan: 9,
  },
];

export default function LongTermProgress() {
  const reduce = useReducedMotion() ?? false;
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useAutoCycle(
    chapters.length,
    4200,
    !reduce && !paused,
  );
  const chapter = chapters[index];

  return (
    <HomeSection id="journey">
      <SectionIntro
        kicker="A year of this"
        title={
          <>
            Edge is quieter
            <span className="block text-slate-300">than a new strategy.</span>
          </>
        }
        description="Not a glow-up funnel. Twelve months of logging the session until revenge trading has nowhere to hide."
      />

      <div
        className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative pl-2 sm:pl-3">
          <div className="absolute bottom-4 left-5 top-4 w-px bg-white/10 sm:left-6" aria-hidden />
          <motion.div
            className="absolute left-5 top-4 w-px origin-top bg-gradient-to-b from-primary via-accent to-primary/20 sm:left-6"
            aria-hidden
            animate={{ height: `${((index + 0.35) / chapters.length) * 100}%` }}
            transition={{ duration: 0.5, ease: homeEase }}
            style={{ maxHeight: "calc(100% - 2rem)" }}
          />

          <ol className="space-y-3">
            {chapters.map((item, itemIndex) => {
              const on = itemIndex === index;

              return (
                <li key={item.when}>
                  <button
                    type="button"
                    onClick={() => setIndex(itemIndex)}
                    className={cn(
                      "relative w-full rounded-[1.35rem] border py-4 pl-12 pr-4 text-left transition-colors sm:pl-14",
                      on
                        ? "border-primary/30 bg-primary/10"
                        : "border-white/8 bg-[#09111f]/70 hover:bg-white/[0.04]",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-3.5 top-6 h-3.5 w-3.5 rounded-full border-2 sm:left-4",
                        on
                          ? "border-primary bg-primary shadow-[0_0_16px_rgba(0,212,255,0.75)]"
                          : "border-slate-500 bg-[#050816]",
                      )}
                    />
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/75">
                      {item.when}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.body}</p>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <motion.div
          layout
          className="sticky top-28 overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#09111f]/90 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.4)] sm:p-6"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
            {chapter.when}
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{chapter.title}</h3>

          <div className="mt-6">
            <div className="flex items-end justify-between gap-3">
              <p className="text-sm text-slate-400">Discipline</p>
              <p className="text-3xl font-semibold tabular-nums text-white">
                <CountUp
                  key={chapter.discipline}
                  end={chapter.discipline}
                  duration={reduce ? 0 : 0.9}
                  suffix="%"
                />
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className="juvo-flow-bar h-full rounded-full bg-gradient-to-r from-primary to-accent"
                animate={{ width: `${chapter.discipline}%` }}
                transition={{ duration: reduce ? 0 : 0.7, ease: homeEase }}
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Stat
              label="Revenge flags"
              value={chapter.revenge}
              reduce={reduce}
              hint="days tagged"
            />
            <Stat
              label="Plan hits"
              value={chapter.plan}
              reduce={reduce}
              suffix="/10"
              hint="per 10 trades"
            />
          </div>

          <div className="mt-6 flex gap-1.5" aria-hidden>
            {chapters.map((item, itemIndex) => (
              <span
                key={item.when}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  itemIndex === index ? "w-8 bg-primary" : "w-3 bg-white/15",
                )}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </HomeSection>
  );
}

function Stat({
  label,
  value,
  reduce,
  suffix = "",
  hint,
}: {
  label: string;
  value: number;
  reduce: boolean;
  suffix?: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
        <CountUp key={`${label}-${value}`} end={value} duration={reduce ? 0 : 0.8} suffix={suffix} />
      </p>
      <p className="mt-1 text-[11px] text-slate-500">{hint}</p>
    </div>
  );
}
