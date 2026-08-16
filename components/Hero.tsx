"use client";

import { useLayoutEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import Image from "next/image";
import {
  ArrowRight,
  Brain,
  CalendarDays,
  CheckCircle2,
  NotebookPen,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import images from "@/constants/images.service";
import Button from "@/components/ui/Button";

function scrollToTarget(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Hero() {
  const heroRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".juvo-hero-copy > *", {
        opacity: 0,
        y: 24,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
      });

      gsap.from(".juvo-hero-visual", {
        opacity: 0,
        x: 42,
        scale: 0.97,
        duration: 1,
        ease: "power3.out",
        delay: 0.15,
      });

      gsap.to(".juvo-hero-orb", {
        y: 14,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      id="top"
      className="relative overflow-hidden pt-10 lg:pt-16"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="juvo-hero-orb absolute left-[-8%] top-6 h-72 w-72 rounded-full bg-cyan-400/14 blur-3xl" />
        <div className="absolute right-[-10%] top-24 h-80 w-80 rounded-full bg-blue-500/14 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20">
        <div className="juvo-hero-copy max-w-3xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-cyan-100/80">
            <Sparkles className="h-3.5 w-3.5" />
            Building Discipline
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Trade with intent.
            <span className="block bg-gradient-to-r from-cyan-300 via-white to-blue-300 bg-clip-text text-transparent">
              Build discipline over time.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg lg:text-xl">
            JUVO helps traders journal decisions, understand emotional patterns,
            track progress, and build the discipline needed for long-term
            consistency.
          </p>

          <div className="juvo-hero-buttons mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
            <Button
              variant="primary"
              onClick={() => scrollToTarget("pricing")}
              className="min-w-[200px]"
            >
              Start Your Journey
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              onClick={() => scrollToTarget("how-it-works")}
              className="min-w-[200px]"
            >
              See How JUVO Works
            </Button>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { icon: NotebookPen, label: "Structured journaling" },
              { icon: CalendarDays, label: "Trading rhythm at a glance" },
              { icon: CheckCircle2, label: "Discipline-first design" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-300 shadow-[0_10px_35px_rgba(2,6,23,0.26)] backdrop-blur"
              >
                <item.icon className="h-4 w-4 text-cyan-300" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="juvo-hero-visual relative"
        >
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 blur-2xl" />
          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-4 shadow-[0_30px_90px_rgba(2,6,23,0.45)] backdrop-blur-2xl">
            <div className="rounded-[1.5rem] border border-white/10 bg-[#08111f]/90 p-4 sm:p-5">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1.5">
                    <Image
                      src={images.appLogo}
                      alt="JUVO logo"
                      fill
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Juvo Calendar
                    </p>
                    <p className="text-xs text-slate-400">
                      Illustrative marketing preview
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/8 px-3 py-2 text-right">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-100/70">
                    Monthly snapshot
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">+$335</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Trading calendar
                      </p>
                      <p className="text-xs text-slate-400">
                        Sample daily outcomes and weekly rhythm
                      </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      <CalendarDays className="h-3.5 w-3.5 text-cyan-300" />5
                      active sessions
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] text-slate-400">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div key={day} className="py-1">
                        {day}
                      </div>
                    ))}

                    {[
                      "+$120",
                      "-$40",
                      "+$75",
                      "+$210",
                      "-$30",
                      "",
                      "",
                      "",
                      "+$85",
                      "-$20",
                      "+$45",
                      "+$110",
                      "",
                      "",
                      "",
                      "+$30",
                      "+$55",
                      "-$15",
                      "+$95",
                      "+$40",
                      "",
                      "",
                      "",
                      "",
                      "+$125",
                      "+$70",
                      "-$25",
                      "+$45",
                      "+$80",
                    ].map((value, index) => (
                      <div
                        key={`${value}-${index}`}
                        className={`flex h-12 items-center justify-center rounded-2xl border text-[11px] font-semibold ${
                          value
                            ? value.startsWith("+")
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                              : "border-rose-400/20 bg-rose-400/10 text-rose-200"
                            : "border-white/5 bg-white/[0.02] text-slate-500"
                        }`}
                      >
                        {value || "•"}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      ["Week total", "+$410"],
                      ["Best day", "+$210"],
                      ["Rule hits", "4/5"],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/8 bg-[#0b1425] p-3"
                      >
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          {label}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="juvo-floating-card rounded-[1.5rem] border border-white/8 bg-[#0b1425] p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">
                      Journal note
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      "I entered early because I saw momentum. Next time I need
                      a confirmation rule before pressing the button."
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Illustrative reflection captured in JUVO
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    {[
                      {
                        label: "Discipline",
                        value: "92%",
                        caption: "Plan adherence preview",
                      },
                      {
                        label: "Emotional state",
                        value: "Calm",
                        caption: "Example mood annotation",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[1.25rem] border border-white/8 bg-white/5 p-4"
                      >
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-2 text-xl font-semibold text-white">
                          {item.value}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-2 top-10 hidden w-44 rounded-2xl border border-white/10 bg-[#0a1220]/90 p-4 shadow-xl shadow-slate-950/40 backdrop-blur-lg lg:block"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">
              Session note
            </p>
            <p className="mt-2 text-sm text-white">Wait for confirmation.</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-4 bottom-8 hidden w-44 rounded-2xl border border-white/10 bg-[#0a1220]/90 p-4 shadow-xl shadow-slate-950/40 backdrop-blur-lg lg:block"
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/70">
              Rule check
            </p>
            <p className="mt-2 text-sm text-white">Trade only A+ setups.</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
