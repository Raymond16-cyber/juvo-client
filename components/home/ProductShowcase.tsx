"use client";

import { cn } from "@/lib/ui";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  LineChart,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  AppChrome,
  HomeSection,
  SectionIntro,
  homeEase,
  useAutoCycle,
} from "./shared";

const views = [
  {
    id: "calendar",
    icon: CalendarDays,
    label: "Calendar",
    title: "The month, without the story you tell yourself.",
    body: "Green is a logged day. Red is a logged day. Empty is the day you skipped the journal — which is usually the day worth looking at.",
  },
  {
    id: "journal",
    icon: LineChart,
    label: "Journal",
    title: "Write it before the memory gets kind.",
    body: "Bias, confidence, the trade, whether the plan survived. Same fields you fill after a session — not a recap you dress up later.",
  },
  {
    id: "insights",
    icon: Sparkles,
    label: "Insights",
    title: "The leak has a name. It shows up more than once.",
    body: "FOMO, revenge, size-up after a loss. Juvo tags it from the notes, so you stop calling it ‘just one more scalp’.",
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Analytics",
    title: "Win rate is a column. Discipline sits next to it.",
    body: "P/L by symbol and session, next to whether you actually followed the plan. The number that went up is not always the useful one.",
  },
] as const;

const calendarDays: Array<{
  day: number | null;
  pnl?: string;
  today?: boolean;
}> = [
  { day: null },
  { day: null },
  { day: 1, pnl: "+$120" },
  { day: 2, pnl: "-$40" },
  { day: 3, pnl: "+$75", today: true },
  { day: 4, pnl: "+$210" },
  { day: 5, pnl: "-$30" },
  { day: 6 },
  { day: 7 },
  { day: 8, pnl: "+$85" },
  { day: 9, pnl: "-$20" },
  { day: 10, pnl: "+$45" },
  { day: 11, pnl: "+$110" },
  { day: 12, pnl: "-$90" },
  { day: 13 },
  { day: 14 },
  { day: 15, pnl: "+$30" },
  { day: 16, pnl: "+$55" },
  { day: 17, pnl: "-$15" },
  { day: 18, pnl: "+$95" },
  { day: 19, pnl: "+$40" },
  { day: 20 },
  { day: 21 },
  { day: 22, pnl: "+$125" },
  { day: 23, pnl: "+$70" },
  { day: 24, pnl: "-$25" },
  { day: 25, pnl: "+$45" },
  { day: 26, pnl: "+$80" },
  { day: 27 },
  { day: 28 },
  { day: 29, pnl: "+$60" },
  { day: 30, pnl: "-$18" },
  { day: null },
  { day: null },
  { day: null },
];

function CalendarMock({ reduce }: { reduce: boolean }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">September 2026</p>
          <p className="text-xs text-slate-500">Funded · XAU account</p>
        </div>
        <p className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          +$1,012
        </p>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] text-slate-500 sm:gap-1.5 sm:text-[11px]">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-1 font-medium">
            {day}
          </div>
        ))}
        {calendarDays.map((cell, index) => {
          const win = cell.pnl?.startsWith("+");
          const loss = cell.pnl?.startsWith("-");

          return (
            <motion.div
              key={`${cell.day}-${index}`}
              initial={reduce ? false : { opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.012,
                duration: 0.28,
                ease: homeEase,
              }}
              className={cn(
                "flex h-9 flex-col items-center justify-center rounded-xl border sm:h-11",
                cell.today && "ring-1 ring-primary/70",
                win &&
                  "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
                loss && "border-rose-400/20 bg-rose-400/10 text-rose-200",
                !cell.pnl &&
                  cell.day !== null &&
                  "border-white/5 bg-white/[0.02] text-slate-500",
                cell.day === null && "border-transparent text-transparent",
              )}
            >
              <span className="text-[9px] leading-none text-slate-500 sm:text-[10px]">
                {cell.day ?? ""}
              </span>
              <span className="text-[9px] font-semibold leading-none sm:text-[10px]">
                {cell.pnl ?? (cell.day ? "—" : "")}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function JournalMock() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["P/L", "+$210", "text-emerald-300"],
          ["Closed", "2", "text-white"],
          ["Open", "0", "text-white"],
          ["Discipline", "70", "text-primary"],
        ].map(([label, value, tone]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {label}
            </p>
            <p className={cn("mt-1 text-lg font-semibold", tone)}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-primary/80">
          Pre-market
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          London only. No chase if gold already ran 80 pips. If I get stopped,
          I am done — not “one more to make it back.”
        </p>
        <p className="mt-3 text-xs text-slate-500">Confidence before · 7/10</p>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#0b1425] p-3 sm:p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">XAUUSD</p>
            <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              Closed
            </span>
            <span className="text-[11px] text-slate-500">long · London</span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-400">
            Waited for the retest. Size stayed at 0.7%.
          </p>
        </div>
        <p className="shrink-0 text-sm font-semibold text-emerald-300">+$210</p>
      </div>

      <div className="flex flex-wrap gap-2 text-[11px]">
        {[
          ["Followed plan", true],
          ["Respected risk", true],
          ["Revenge traded", false],
        ].map(([label, ok]) => (
          <span
            key={label as string}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1",
              ok
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                : "border-white/10 bg-white/5 text-slate-400",
            )}
          >
            <CheckCircle2 className="h-3 w-3" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function InsightsMock({ reduce }: { reduce: boolean }) {
  const rows = [
    { label: "FOMO entries", value: 38, tone: "bad" },
    { label: "Revenge after a loss", value: 22, tone: "bad" },
    { label: "Size-up mid-drawdown", value: 17, tone: "bad" },
    { label: "Plan followed", value: 71, tone: "good" },
  ];

  return (
    <div className="grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-2.5 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
        {rows.map((row, index) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{row.label}</span>
              <span>{row.value}%</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  row.tone === "good"
                    ? "bg-gradient-to-r from-primary to-accent"
                    : "bg-gradient-to-r from-rose-400/80 to-amber-300/70",
                )}
                initial={reduce ? false : { width: 0 }}
                animate={{ width: `${row.value}%` }}
                transition={{ delay: 0.15 + index * 0.08, duration: 0.7, ease: homeEase }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-primary/80">
          From your notes
        </p>
        <p className="mt-2 text-base font-semibold leading-snug text-white">
          After a red London, you add size on the next gold trade 4 times out of
          5.
        </p>
        <p className="mt-3 text-xs leading-5 text-slate-300">
          Not a signal. A pattern in what you already wrote.
        </p>
      </div>
    </div>
  );
}

function AnalyticsMock({ reduce }: { reduce: boolean }) {
  const sessions = [
    ["London", 68, "+$640"],
    ["New York", 44, "-$120"],
    ["Asia", 51, "+$90"],
  ] as const;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Net P/L", "+$3,240"],
          ["Win rate", "54%"],
          ["Avg RR", "1.8"],
          ["Discipline", "81%"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
          >
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {label}
            </p>
            <p className="mt-1 text-lg font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-[#0b1425] p-4">
          <p className="text-xs font-medium text-slate-400">By session</p>
          <div className="mt-3 space-y-3">
            {sessions.map(([name, pct, pnl], index) => (
              <div key={name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{name}</span>
                  <span
                    className={
                      pnl.startsWith("+") ? "text-emerald-300" : "text-rose-300"
                    }
                  >
                    {pnl}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    initial={reduce ? false : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.12 + index * 0.1, duration: 0.65, ease: homeEase }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-white/8 bg-[#0b1425] p-4">
          <p className="text-xs font-medium text-slate-400">By symbol</p>
          {[
            ["XAUUSD", "+$1,840", "28 trades"],
            ["EURUSD", "-$210", "19 trades"],
            ["NAS100", "+$640", "11 trades"],
          ].map(([symbol, pnl, meta]) => (
            <div
              key={symbol}
              className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2"
            >
              <div>
                <p className="text-sm font-semibold text-white">{symbol}</p>
                <p className="text-[11px] text-slate-500">{meta}</p>
              </div>
              <p
                className={cn(
                  "text-sm font-semibold",
                  pnl.startsWith("+") ? "text-emerald-300" : "text-rose-300",
                )}
              >
                {pnl}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductShowcase() {
  const reduce = useReducedMotion() ?? false;
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useAutoCycle(views.length, 5200, !reduce && !paused);
  const view = views[index];

  return (
    <HomeSection id="showcase">
      <SectionIntro
        kicker="Inside the desk"
        title={
          <>
            The same screens you open
            <span className="block text-slate-300">after you close the charts.</span>
          </>
        }
        description="Calendar, journal, insights, analytics — pulled from the actual workspace, not a pile of feature tiles."
      />

      <div
        className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setPaused(false);
          }
        }}
      >
        <div>
          <div
            role="tablist"
            aria-label="Product views"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
          >
            {views.map((item, itemIndex) => {
              const Icon = item.icon;
              const on = itemIndex === index;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setIndex(itemIndex)}
                  className={cn(
                    "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    on
                      ? "text-slate-950"
                      : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/8",
                  )}
                >
                  {on ? (
                    reduce ? (
                      <span className="absolute inset-0 rounded-full bg-primary" />
                    ) : (
                      <motion.span
                        layoutId="showcase-tab"
                        className="absolute inset-0 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )
                  ) : null}
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view.id}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: homeEase }}
              className="mt-6"
            >
              <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {view.title}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-7 text-slate-300 sm:text-base">
                {view.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex gap-1.5" aria-hidden>
            {views.map((item, itemIndex) => (
              <span
                key={item.id}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  itemIndex === index ? "w-8 bg-primary" : "w-3 bg-white/15",
                )}
              />
            ))}
          </div>
        </div>

        <div className="min-w-0">
          <AppChrome active={view.id} title={view.label}>
            <div className="min-h-[22rem] sm:min-h-[24rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view.id}
                  initial={reduce ? false : { opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -14 }}
                  transition={{ duration: 0.4, ease: homeEase }}
                >
                  {view.id === "calendar" ? <CalendarMock reduce={reduce} /> : null}
                  {view.id === "journal" ? <JournalMock /> : null}
                  {view.id === "insights" ? <InsightsMock reduce={reduce} /> : null}
                  {view.id === "analytics" ? <AnalyticsMock reduce={reduce} /> : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </AppChrome>
        </div>
      </div>
    </HomeSection>
  );
}
