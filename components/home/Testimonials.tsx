"use client";

import { cn } from "@/lib/ui";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import {
  HomeSection,
  SectionIntro,
  homeEase,
  useAutoCycle,
} from "./shared";

const notes = [
  {
    name: "Ada",
    desk: "Gold · London",
    date: "12 Aug",
    quote:
      "Tuesday I revenge-traded gold after a stop. Juvo put it next to Monday’s ‘I will wait for confirmation.’ That was enough. I didn’t need a coach for that one.",
    flags: ["Revenge: yes", "Plan: no"],
    initials: "A",
  },
  {
    name: "Kofi",
    desk: "Indices · NY",
    date: "3 Sep",
    quote:
      "I stopped counting green days. I count days I followed the plan. The calendar doesn’t care that I ‘felt’ the open — it just shows four trades after two losses.",
    flags: ["Overtraded", "NY overlap"],
    initials: "K",
  },
  {
    name: "Mira",
    desk: "EURUSD · Asia",
    date: "21 Jul",
    quote:
      "It’s the only place I admit I entered early. Spreadsheets still said I was up. The note said I was impatient. I believe the note.",
    flags: ["Impatience", "Plan: no"],
    initials: "M",
  },
];

export default function Testimonials() {
  const reduce = useReducedMotion() ?? false;
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useAutoCycle(notes.length, 5600, !reduce && !paused);
  const active = notes[index];

  return (
    <HomeSection id="testimonials">
      <SectionIntro
        kicker="After the session"
        title={
          <>
            Not five-star reviews.
            <span className="block text-slate-300">After-action notes.</span>
          </>
        }
        description="Sample session notes, written like a trader actually talks. Swap in real names when you have them."
      />

      <div
        className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <motion.figure
          className="relative overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#09111f]/90 p-6 sm:p-8"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: homeEase }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/80">
            {active.date} · {active.desk}
          </p>

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={active.name}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: homeEase }}
              className="mt-5 text-xl font-medium leading-8 text-white sm:text-2xl sm:leading-10"
            >
              “{active.quote}”
            </motion.blockquote>
          </AnimatePresence>

          <figcaption className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-sm font-semibold text-primary">
                {active.initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{active.name}</p>
                <p className="text-xs text-slate-500">{active.desk}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {active.flags.map((flag) => (
                <span
                  key={flag}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300"
                >
                  {flag}
                </span>
              ))}
            </div>
          </figcaption>
        </motion.figure>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {notes.map((note, itemIndex) => {
            const on = itemIndex === index;

            return (
              <button
                key={note.name}
                type="button"
                onClick={() => setIndex(itemIndex)}
                className={cn(
                  "rounded-[1.35rem] border p-4 text-left transition-colors",
                  on
                    ? "border-primary/30 bg-primary/10"
                    : "border-white/10 bg-[#09111f]/80 hover:bg-white/[0.04]",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">{note.name}</p>
                  <p className="text-[11px] text-slate-500">{note.date}</p>
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-400">
                  {note.quote}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </HomeSection>
  );
}
