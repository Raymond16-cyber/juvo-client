"use client";

import { cn } from "@/lib/ui";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import {
  AppChrome,
  HomeSection,
  SectionIntro,
  homeEase,
  useAutoCycle,
} from "./shared";

const steps = [
  {
    n: "01",
    title: "Trade",
    line: "Juvo stays off the chart. You take the session.",
    detail:
      "No overlay, no ‘signal of the day.’ When you’re done, you come back here — that’s the product.",
    chrome: "dashboard",
    chromeTitle: "Dashboard",
  },
  {
    n: "02",
    title: "Journal",
    line: "Log it while the story is still ugly.",
    detail:
      "Pre-market note, confidence, the fills, whether you followed the plan. Five minutes. Before you rewrite it as skill.",
    chrome: "journal",
    chromeTitle: "Journal",
  },
  {
    n: "03",
    title: "Read it back",
    line: "The week makes the leak obvious.",
    detail:
      "Calendar shows the days. Insights names the repeat: revenge after gold, size-up in NY, skipped notes on red Fridays.",
    chrome: "insights",
    chromeTitle: "Insights",
  },
  {
    n: "04",
    title: "Tighten one rule",
    line: "Not a new strategy. One constraint you can keep.",
    detail:
      "Max two trades after a loss. London only. Risk stays 0.7%. The plan gets sharper because you have a record, not a vibe.",
    chrome: "calendar",
    chromeTitle: "Calendar",
  },
];

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Live session</p>
            <p className="mt-1 font-semibold text-white">XAUUSD · long</p>
          </div>
          <p className="text-sm font-semibold text-emerald-300">+0.6R</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["London", "0.7% risk", "Plan: wait"].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-white/8 bg-[#0b1425] px-2 py-3 text-center text-[11px] text-slate-300"
            >
              {item}
            </div>
          ))}
        </div>
        <p className="text-xs leading-5 text-slate-500">
          Charts stay where they are. Juvo is the room you walk into after.
        </p>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-primary/80">Pre-market</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            If gold already ran, I do not chase. One attempt. Then I’m done.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
          {["Confidence 7/10", "Followed plan", "No revenge"].map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-[10px] uppercase tracking-[0.16em] text-primary/80">Repeat</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-white">
            Four of the last five red days, the next trade was larger.
          </p>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["+", "-", "+", "+", "-", "", "+"].map((mark, i) => (
            <div
              key={i}
              className={cn(
                "grid h-8 place-items-center rounded-lg text-[10px] font-semibold",
                mark === "+" && "bg-emerald-400/15 text-emerald-200",
                mark === "-" && "bg-rose-400/15 text-rose-200",
                mark === "" && "bg-white/5 text-slate-600",
              )}
            >
              {mark || "·"}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {[
        "Max 2 trades after a full stop.",
        "No NY size-up if London was red.",
        "Journal before the next session, not on Sunday.",
      ].map((rule) => (
        <div
          key={rule}
          className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300"
        >
          {rule}
        </div>
      ))}
    </div>
  );
}

export default function HowItWorks() {
  const reduce = useReducedMotion() ?? false;
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useAutoCycle(steps.length, 4800, !reduce && !paused);
  const step = steps[index];

  return (
    <HomeSection id="how-it-works">
      <SectionIntro
        kicker="How it works"
        title={
          <>
            Four moves.
            <span className="block text-slate-300">Same loop every session.</span>
          </>
        }
        description="Trade. Write what actually happened. Look at the week. Change one rule. That’s the whole product."
      />

      <div
        className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative">
          <div
            className="absolute bottom-3 left-[1.15rem] top-3 hidden w-px bg-white/10 sm:block"
            aria-hidden
          />
          <motion.div
            className="absolute left-[1.15rem] top-3 hidden w-px origin-top bg-gradient-to-b from-primary to-accent sm:block"
            aria-hidden
            initial={false}
            animate={{ scaleY: (index + 1) / steps.length }}
            transition={{ duration: 0.45, ease: homeEase }}
            style={{ height: "calc(100% - 1.5rem)" }}
          />

          <div className="space-y-2">
            {steps.map((item, itemIndex) => {
              const on = itemIndex === index;

              return (
                <button
                  key={item.n}
                  type="button"
                  onClick={() => setIndex(itemIndex)}
                  className={cn(
                    "relative flex w-full gap-4 rounded-2xl border px-4 py-4 text-left transition-colors sm:pl-12",
                    on
                      ? "border-primary/25 bg-primary/8"
                      : "border-white/8 bg-white/[0.02] hover:bg-white/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "absolute left-3 top-1/2 hidden h-3 w-3 -translate-y-1/2 rounded-full border-2 sm:block",
                      on
                        ? "border-primary bg-primary shadow-[0_0_12px_rgba(0,212,255,0.7)]"
                        : "border-slate-600 bg-[#050816]",
                    )}
                  />
                  <span className="text-sm font-semibold tabular-nums text-primary/80">
                    {item.n}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-white">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-slate-400">
                      {item.line}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <AppChrome active={step.chrome} title={step.chromeTitle}>
          <div className="min-h-[16.5rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.n}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: homeEase }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
                  Step {step.n}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 mb-5 text-sm leading-6 text-slate-400">{step.detail}</p>
                <StepVisual index={index} />
              </motion.div>
            </AnimatePresence>
          </div>
        </AppChrome>
      </div>
    </HomeSection>
  );
}
