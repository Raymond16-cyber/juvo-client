"use client";

import AnalyticsSection from "@/components/home/AnalyticsSection";
import HowItWorks from "@/components/home/HowItWorks";
import LongTermProgress from "@/components/home/LongTermProgress";
import Pricing from "@/components/home/Pricing";
import ProductShowcase from "@/components/home/ProductShowcase";
import Testimonials from "@/components/home/Testimonials";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Flame,
  Gauge,
  LayoutDashboard,
  ListChecks,
  NotebookPen,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
};

function scrollToTarget(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  centered = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  centered?: boolean;
}) {
  return (
    <section id={id} className="relative">
      <div className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
        <div className={`max-w-3xl ${centered ? "mx-auto text-center" : ""}`}>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-cyan-100/80">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
            {description}
          </p>
        </div>

        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}

function RevealCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.65, delay }}
    >
      {children}
    </motion.div>
  );
}

const featureCards = [
  {
    icon: NotebookPen,
    title: "Structured journaling",
    desc: "Capture the why behind each trade, not just the entry and exit.",
  },
  {
    icon: CalendarDays,
    title: "Trading calendar",
    desc: "See your trading rhythm, wins, losses, and momentum in one view.",
  },
  {
    icon: CheckCircle2,
    title: "Plan adherence",
    desc: "Track whether you followed your rules and identify where discipline slips.",
  },
  {
    icon: BarChart3,
    title: "Performance visuals",
    desc: "Understand how your approach performs across sessions and setups.",
  },
  {
    icon: ShieldCheck,
    title: "Behavioral clarity",
    desc: "Spot FOMO, revenge trading, impatience, and other repeat behaviors.",
  },
  {
    icon: LayoutDashboard,
    title: "Trader journey",
    desc: "Turn scattered entries into a long-term development narrative.",
  },
];

const problemCards = [
  {
    icon: Flame,
    title: "FOMO",
    desc: "Jumping into a move because you feel late, not because the setup is valid.",
  },
  {
    icon: RefreshCcw,
    title: "Revenge trading",
    desc: "Trying to force back a loss instead of respecting the next clean setup.",
  },
  {
    icon: Zap,
    title: "Overtrading",
    desc: "Taking too many trades and losing focus on quality over quantity.",
  },
  {
    icon: TimerReset,
    title: "Impatience",
    desc: "Entering before confirmation because waiting feels uncomfortable.",
  },
  {
    icon: Brain,
    title: "Emotional decisions",
    desc: "Letting stress, excitement, or frustration make the next decision.",
  },
  {
    icon: CircleAlert,
    title: "Breaking rules",
    desc: "Knowing the plan, but drifting away from it when pressure builds.",
  },
];

const faqItems = [
  {
    question: "What is JUVO?",
    answer:
      "JUVO is a trading journal and trader-development platform built to help traders improve discipline, self-awareness, and consistency.",
  },
  {
    question: "Who is JUVO for?",
    answer:
      "Traders who want to review their decisions, understand their behavior, and use journaling as a way to grow over time.",
  },
  {
    question: "Is JUVO only for forex traders?",
    answer:
      "No. JUVO is positioned for traders across markets, including forex, futures, crypto, and equities.",
  },
  {
    question: "Can I connect my trading account?",
    answer:
      "This homepage does not promise a broker connection. Any import or connection capability should be treated as a product detail to confirm in the app.",
  },
  {
    question: "Can I import my trading history?",
    answer:
      "The product can support import workflows, but the exact availability should be documented in the app or release notes.",
  },
  {
    question: "What is Behavioral Insights?",
    answer:
      "It is a way to surface repeated patterns in your journaling data, such as FOMO, revenge trading, impatience, or rule-breaking.",
  },
  {
    question: "Is JUVO free?",
    answer:
      "A free tier can exist, but pricing is intentionally left flexible here until the product decision is finalized.",
  },
  {
    question: "Is JUVO an AI signal platform?",
    answer:
      "No. JUVO is not a signal provider and does not promise profitability. It is built around journaling, analysis, and trader development.",
  },
];

export default function HomepageSections() {
  return (
    <>
      <SectionShell
        id="features"
        eyebrow="Features"
        title="Everything a trader needs to build discipline, not just record data."
        description="JUVO is built to help traders reflect on decisions, understand the behavior behind results, and move from isolated trades to a more intentional process."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((card, index) => (
            <RevealCard key={card.title} delay={index * 0.04}>
              <article className="h-full rounded-[1.5rem] border border-white/10 bg-[#09111f]/85 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl transition-transform hover:-translate-y-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {card.desc}
                </p>
              </article>
            </RevealCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="problem"
        eyebrow="The problem"
        title="Your strategy is not always the thing that breaks."
        description="Many traders already know what they should do. The issue is execution, emotion, and repeating behavior under pressure."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {problemCards.map((card, index) => (
            <RevealCard key={card.title} delay={index * 0.04}>
              <article className="h-full rounded-[1.5rem] border border-white/10 bg-[#09111f]/85 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)] backdrop-blur-xl transition-transform hover:-translate-y-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-200">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {card.desc}
                </p>
              </article>
            </RevealCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="solution"
        eyebrow="The JUVO solution"
        title="Turn every trade into a lesson."
        description="JUVO helps traders document what they traded, why they entered, how they felt, how much they risked, what happened, whether they followed the plan, and what they learned."
        centered
      >
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <RevealCard>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
              <p className="text-sm font-medium text-white">
                What JUVO captures
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "What I traded",
                  "Why I entered",
                  "How I felt",
                  "How much I risked",
                  "What happened",
                  "Did I follow the plan?",
                  "What I learned",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#0b1425] px-4 py-3 text-sm text-slate-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </RevealCard>

          <RevealCard delay={0.08}>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  icon: NotebookPen,
                  title: "Document the trade",
                  desc: "Add the context that a chart alone cannot tell you.",
                },
                {
                  icon: Brain,
                  title: "Capture emotion",
                  desc: "Track how you felt before, during, and after execution.",
                },
                {
                  icon: Gauge,
                  title: "Measure discipline",
                  desc: "See where you followed your rules and where you drifted.",
                },
                {
                  icon: Target,
                  title: "Extract the lesson",
                  desc: "Translate each session into a practical improvement cycle.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.5rem] border border-white/10 bg-[#09111f]/85 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-200">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </RevealCard>
        </div>
      </SectionShell>

      <SectionShell
        id="showcase"
        eyebrow="Product showcase"
        title="A product preview that makes the platform feel real."
        description="Use the carousel to introduce the different JUVO views without pretending the website is the app itself."
      >
        <ProductCarousel />
      </SectionShell>

      <SectionShell
        id="calendar"
        eyebrow="JUVO calendar"
        title="See your trading journey at a glance."
        description="The calendar view surfaces wins, losses, and weekly totals so traders can recognize rhythm and consistency."
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <RevealCard>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
              <div className="rounded-[1.25rem] border border-white/10 bg-[#0a1220]/90 p-4">
                <div className="flex items-center justify-between border-b border-white/8 pb-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      August journal calendar
                    </p>
                    <p className="text-xs text-slate-400">
                      Illustrative performance view
                    </p>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                    Month total +$335
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-7 gap-2 text-center text-[11px] text-slate-400">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day) => (
                      <div key={day} className="py-1">
                        {day}
                      </div>
                    ),
                  )}
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
                      className={`flex h-11 items-center justify-center rounded-2xl border text-[11px] font-semibold ${
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
                    ["Weekly total", "+$410"],
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
            </div>
          </RevealCard>

          <RevealCard delay={0.08}>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
              <p className="text-sm font-medium text-white">
                Why the calendar matters
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {[
                  "See the consistency of your trading sessions over time.",
                  "Identify sequences where discipline slips after wins or losses.",
                  "Use weekly and monthly totals to understand rhythm, not hype.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-[#0b1425] p-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-cyan-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealCard>
        </div>
      </SectionShell>

      <SectionShell
        id="insights"
        eyebrow="Behavioral insights"
        title="Your biggest trading edge might be understanding yourself."
        description="Illustrative insights show how JUVO can surface recurring behavior patterns from journaling data without making promises about profitability."
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <RevealCard>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#09111f]/85 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
              <div className="flex items-center justify-between border-b border-white/8 pb-4">
                <div>
                  <p className="text-sm font-medium text-white">
                    Behavior signals
                  </p>
                  <p className="text-xs text-slate-400">
                    Illustrative categories from journal data
                  </p>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-200">
                  Pattern review
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  "FOMO",
                  "Revenge Trading",
                  "Impatience",
                  "Euphoria",
                  "Overtrading",
                  "Controlled Trading",
                ].map((signal, index) => (
                  <div
                    key={signal}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                      index === 5
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                        : "border-white/8 bg-[#0b1425] text-slate-300"
                    }`}
                  >
                    <span>{signal}</span>
                    <span className="text-xs text-slate-500">
                      {index === 5 ? "Healthy" : "Flagged"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </RevealCard>

          <RevealCard delay={0.06}>
            <div className="grid gap-4">
              <div className="rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/8 p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-100/70">
                  Example insight
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  You tend to increase your risk after a losing trade.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-[#09111f]/85 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
                <p className="text-sm font-medium text-white">
                  Your strongest performance occurs when you trade fewer than 3
                  setups per day.
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    ["Fewer setups", 84],
                    ["More setups", 42],
                    ["Late session entries", 58],
                  ].map(([label, value]) => (
                    <div key={label as string}>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>{label}</span>
                        <span>{value}% consistency</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/5">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealCard>
        </div>
      </SectionShell>

      <SectionShell
        id="trading-plan"
        eyebrow="Trading plan"
        title="Don't just have a strategy. Have a plan."
        description="Juvo helps traders define the rules that shape execution before the first click of the session."
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <RevealCard>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
              <p className="text-sm font-medium text-white">Plan blueprint</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["Strategy", "Trend continuation"],
                  ["Risk per trade", "1R"],
                  ["Maximum daily trades", "3"],
                  ["Maximum daily loss", "-2R"],
                  ["Minimum R:R", "2:1"],
                  ["Trading sessions", "London / NY open"],
                  ["Rules", "No impulsive setups"],
                  ["Checklist", "Confirmation, risk, journal"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/8 bg-[#0b1425] p-4"
                  >
                    <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                      {label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </RevealCard>

          <RevealCard delay={0.08}>
            <div className="space-y-3 rounded-[1.75rem] border border-white/10 bg-[#09111f]/85 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
              {[
                "Wait for confirmation before entry.",
                "Do not trade after a daily loss limit is hit.",
                "Record emotion before and after every trade.",
                "Review every trade within 24 hours.",
              ].map((rule) => (
                <div
                  key={rule}
                  className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 p-4 text-sm text-slate-300"
                >
                  <ListChecks className="mt-0.5 h-4 w-4 text-cyan-300" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </RevealCard>
        </div>
      </SectionShell>

      <SectionShell
        id="analytics"
        eyebrow="Analytics"
        title="Understand your performance without turning the site into a spreadsheet."
        description="These are marketing visuals, designed to make the product feel tangible while keeping the homepage focused on discipline and insight."
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <RevealCard>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Win rate", 54, "%"],
                ["Profit factor", 1.72, ""],
                ["Average R", 1.8, ""],
                ["P/L", 3240, "$"],
              ].map(([label, value, suffix]) => (
                <div
                  key={label as string}
                  className="rounded-[1.5rem] border border-white/10 bg-[#09111f]/85 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)]"
                >
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {typeof value === "number" ? (
                      <CountUp
                        end={value}
                        duration={1.4}
                        decimals={
                          label === "Profit factor" || label === "Average R"
                            ? 2
                            : 0
                        }
                      />
                    ) : (
                      value
                    )}
                    {suffix}
                  </p>
                </div>
              ))}
            </div>
          </RevealCard>

          <RevealCard delay={0.08}>
            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    Illustrative performance chart
                  </p>
                  <p className="text-xs text-slate-400">
                    Session-level P/L preview
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <TrendingUp className="h-4 w-4" />
                  Positive trend
                </div>
              </div>

              <div className="mt-6 h-56 rounded-[1.25rem] border border-white/8 bg-[#0b1425] p-4">
                <PerformanceChart />
              </div>
            </div>
          </RevealCard>
        </div>
      </SectionShell>

      <SectionShell
        id="how-it-works"
        eyebrow="How it works"
        title="Trade. Journal. Understand. Improve."
        description="The experience should be simple enough to explain in seconds and clear enough to feel real."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              Activity,
              "Trade",
              "Take your trades as you normally would, then log what happened.",
            ],
            [
              BookOpenText,
              "Journal",
              "Record context, emotions, risk, outcome, and the lesson.",
            ],
            [
              Brain,
              "Understand",
              "Review patterns and identify what drives strong or weak decisions.",
            ],
            [
              Workflow,
              "Improve",
              "Use the insights and the plan to refine your process over time.",
            ],
          ].map(([Icon, title, desc], index) => (
            <RevealCard key={title as string} delay={index * 0.04}>
              <div className="h-full rounded-[1.5rem] border border-white/10 bg-[#09111f]/85 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-200">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm uppercase tracking-[0.22em] text-slate-500">
                  Step {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  {title as string}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {desc as string}
                </p>
              </div>
            </RevealCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="why-juvo"
        eyebrow="Why JUVO"
        title="Because your trading history is more than numbers."
        description="A spreadsheet can tell you what happened. JUVO is designed to help you understand why it happened."
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <RevealCard>
            <div className="rounded-[1.75rem] border border-white/10 bg-[#09111f]/85 p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
              <p className="text-sm font-medium text-white">Spreadsheet</p>
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                {[
                  "Lists trades and results.",
                  "Shows numbers, dates, and outcomes.",
                  "Can become hard to interpret over time.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 p-3"
                  >
                    <TrendingDown className="mt-0.5 h-4 w-4 text-rose-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealCard>

          <RevealCard delay={0.08}>
            <div className="rounded-[1.75rem] border border-cyan-400/20 bg-cyan-400/8 p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)]">
              <p className="text-sm font-medium text-white">JUVO</p>
              <div className="mt-4 space-y-3 text-sm text-cyan-50/85">
                {[
                  "Shows what happened and why it may have happened.",
                  "Connects the result to the plan, emotion, and behavior.",
                  "Helps traders turn history into process improvement.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-[#0b1425] p-3"
                  >
                    <TrendingUp className="mt-0.5 h-4 w-4 text-cyan-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </RevealCard>
        </div>
      </SectionShell>

      <SectionShell
        id="journey"
        eyebrow="Long-term progress"
        title="Your edge is built over time."
        description="The page should reinforce the idea that journaling is a long game, not a quick fix."
        centered
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Month 1",
              value: "Foundations",
              detail: "Journal every trade and identify repeating behaviors.",
            },
            {
              label: "Month 3",
              value: "Patterns",
              detail: "Start seeing which setups and habits repeat.",
            },
            {
              label: "Month 6",
              value: "Refinement",
              detail: "Align your rules, review cadence, and risk process.",
            },
            {
              label: "Year 1",
              value: "A stronger process",
              detail: "Build a long-term view of your trading development.",
            },
          ].map((item, index) => (
            <RevealCard key={item.label} delay={index * 0.04}>
              <div className="h-full rounded-[1.5rem] border border-white/10 bg-[#09111f]/85 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  {item.label}
                </p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {item.value}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {item.detail}
                </p>
              </div>
            </RevealCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="testimonials"
        eyebrow="Testimonials"
        title="Placeholder testimonials for the marketing UI."
        description="These are clearly marked placeholders so the structure can be replaced with real user quotes later."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((item, index) => (
            <RevealCard key={item.name} delay={index * 0.05}>
              <div className="h-full rounded-[1.5rem] border border-white/10 bg-[#09111f]/85 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
                <MessageSquareQuote className="h-5 w-5 text-cyan-300" />
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {item.quote}
                </p>
                <div className="mt-6 border-t border-white/8 pt-4">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              </div>
            </RevealCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="pricing"
        eyebrow="Pricing"
        title="Clean pricing that can be updated when the product is ready."
        description="The current structure keeps the tiers honest and flexible while still presenting a polished conversion path."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          {pricingPlans.map((plan, index) => (
            <RevealCard key={plan.name} delay={index * 0.05}>
              <div
                className={`h-full rounded-[1.75rem] border p-6 shadow-[0_24px_80px_rgba(2,6,23,0.35)] ${
                  plan.accent
                    ? "border-cyan-400/25 bg-cyan-400/8"
                    : "border-white/10 bg-[#09111f]/85"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {plan.name}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {plan.price}
                    </p>
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {plan.accent ? "Recommended" : "Starter"}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {plan.desc}
                </p>

                <div className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Button
                  variant={plan.accent ? "primary" : "ghost"}
                  className="mt-6 w-full"
                  onClick={() => scrollToTarget("top")}
                >
                  {plan.accent ? "Start Your Journey" : "Explore JUVO"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </RevealCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell
        id="faq"
        eyebrow="FAQ"
        title="Honest answers to common questions."
        description="The website should clarify what JUVO is, who it is for, and what it is not."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {faqItems.map((item, index) => (
            <RevealCard key={item.question} delay={index * 0.03}>
              <details className="group rounded-[1.5rem] border border-white/10 bg-[#09111f]/85 p-5 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-medium text-white">
                  {item.question}
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90" />
                </summary>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  {item.answer}
                </p>
              </details>
            </RevealCard>
          ))}
        </div>
      </SectionShell>

      <section id="cta" className="relative">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:py-28">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/12 via-[#09111f] to-blue-500/12 p-8 shadow-[0_30px_100px_rgba(2,6,23,0.45)] lg:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,212,255,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_28%)]" />

            <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-cyan-100/80">
                  <Sparkles className="h-3.5 w-3.5" />
                  Final CTA
                </div>

                <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Your next level is not another strategy.
                  <span className="block bg-gradient-to-r from-cyan-300 via-white to-blue-300 bg-clip-text text-transparent">
                    It is better discipline.
                  </span>
                </h2>

                <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  JUVO is built to help traders document decisions, understand
                  behavior, and improve over time with a product that feels
                  serious, premium, and focused.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Button
                    variant="primary"
                    onClick={() => scrollToTarget("pricing")}
                  >
                    Start Your Journey
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => scrollToTarget("features")}
                  >
                    Explore JUVO
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [NotebookPen, "Journal every trade"],
                  [CalendarDays, "See the full picture"],
                  [Brain, "Understand behavior"],
                  [ShieldCheck, "Build discipline"],
                ].map(([Icon, label], index) => (
                  <RevealCard key={label as string} delay={index * 0.04}>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl">
                      <Icon className="h-5 w-5 text-cyan-300" />
                      <p className="mt-4 text-sm font-medium text-white">
                        {label as string}
                      </p>
                    </div>
                  </RevealCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
