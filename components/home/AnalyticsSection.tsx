"use client";

import PerformanceChart from "@/components/HomePerfomanceChart";
import { cn } from "@/lib/ui";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import CountUp from "react-countup";
import { HomeSection, SectionIntro, homeEase } from "./shared";

const metrics = [
  { label: "Net P/L", end: 3240, prefix: "+$", decimals: 0, note: "Closed trades only" },
  { label: "Win rate", end: 54, suffix: "%", decimals: 0, note: "Vanity until you pair it" },
  { label: "Avg RR", end: 1.8, suffix: "", decimals: 1, note: "On planned 2R setups" },
  { label: "Discipline", end: 81, suffix: "%", decimals: 0, note: "Plan hits vs. taken trades" },
];

const sessions = [
  {
    name: "London",
    pnl: "+$640",
    win: 62,
    trades: 24,
    note: "Where the rules usually hold. Two trades, then stop.",
    width: 78,
  },
  {
    name: "New York",
    pnl: "-$120",
    win: 41,
    trades: 19,
    note: "Overlap is where size creeps. Most revenge tags live here.",
    width: 46,
  },
  {
    name: "Asia",
    pnl: "+$90",
    win: 50,
    trades: 8,
    note: "Fewer trades. Cleaner notes. Easy to skip journaling.",
    width: 34,
  },
];

const symbols = [
  { symbol: "XAUUSD", pnl: "+$1,840", trades: 28, win: 57 },
  { symbol: "EURUSD", pnl: "-$210", trades: 19, win: 42 },
  { symbol: "NAS100", pnl: "+$640", trades: 11, win: 64 },
];

export default function AnalyticsSection() {
  const reduce = useReducedMotion() ?? false;
  const metricsRef = useRef<HTMLDivElement>(null);
  const inView = useInView(metricsRef, { once: true, amount: 0.4 });
  const [session, setSession] = useState(0);
  const active = sessions[session];

  return (
    <HomeSection id="analytics">
      <SectionIntro
        kicker="Analytics"
        title={
          <>
            The week, not the last winner.
          </>
        }
        description="Juvo builds this from journals on the selected account — win rate next to discipline, P/L next to the session that actually produced it."
      />

      <div className="mt-12 grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <div ref={metricsRef} className="grid gap-3 sm:grid-cols-2">
          {metrics.map((item, index) => (
            <motion.article
              key={item.label}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.06, duration: 0.55, ease: homeEase }}
              className="rounded-[1.35rem] border border-white/10 bg-[#09111f]/90 p-5"
            >
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
                {item.prefix}
                {inView ? (
                  <CountUp
                    end={item.end}
                    duration={reduce ? 0 : 1.35}
                    decimals={item.decimals}
                    separator=","
                  />
                ) : (
                  0
                )}
                {item.suffix}
              </p>
              <p className="mt-2 text-xs text-slate-500">{item.note}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.65, ease: homeEase }}
          className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(2,6,23,0.35)] sm:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-white">Equity from logged days</p>
              <p className="text-xs text-slate-500">Sample curve · session-level P/L</p>
            </div>
            <p className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
              +$3,240
            </p>
          </div>
          <div className="mt-4 h-52 sm:h-60">
            <PerformanceChart />
          </div>
        </motion.div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: homeEase }}
          className="rounded-[1.5rem] border border-white/10 bg-[#09111f]/90 p-5"
        >
          <p className="text-sm font-semibold text-white">By session</p>
          <p className="mt-1 text-xs text-slate-500">Tap a session. The leak is usually not “the market.”</p>

          <div className="mt-5 space-y-2">
            {sessions.map((item, index) => {
              const on = index === session;
              const win = item.pnl.startsWith("+");

              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setSession(index)}
                  className={cn(
                    "w-full rounded-2xl border p-3 text-left transition-colors",
                    on
                      ? "border-primary/30 bg-primary/10"
                      : "border-white/8 bg-white/[0.03] hover:bg-white/[0.05]",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.trades} trades · {item.win}% win
                      </p>
                    </div>
                    <p className={cn("text-sm font-semibold", win ? "text-emerald-300" : "text-rose-300")}>
                      {item.pnl}
                    </p>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                      initial={reduce ? false : { width: 0 }}
                      whileInView={{ width: `${item.width}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: homeEase, delay: index * 0.08 }}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <AnimateNote text={active.note} />
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.08, ease: homeEase }}
          className="rounded-[1.5rem] border border-white/10 bg-[#09111f]/90 p-5"
        >
          <p className="text-sm font-semibold text-white">By symbol</p>
          <p className="mt-1 text-xs text-slate-500">Where the account actually lives.</p>

          <div className="mt-5 space-y-3">
            {symbols.map((item, index) => (
              <motion.div
                key={item.symbol}
                initial={reduce ? false : { opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07, duration: 0.45, ease: homeEase }}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-white">{item.symbol}</p>
                  <p className="text-[11px] text-slate-500">
                    {item.trades} trades · {item.win}% win
                  </p>
                </div>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    item.pnl.startsWith("+") ? "text-emerald-300" : "text-rose-300",
                  )}
                >
                  {item.pnl}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </HomeSection>
  );
}

function AnimateNote({ text }: { text: string }) {
  return (
    <motion.p
      key={text}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-slate-300"
    >
      {text}
    </motion.p>
  );
}
