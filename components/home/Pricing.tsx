"use client";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/ui";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { HomeSection, SectionIntro, homeEase } from "./shared";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "The daily loop. Journal, calendar, enough analytics to see the week.",
    features: [
      "Daily journal + pre-market notes",
      "Juvo Calendar",
      "Manual trading accounts",
      "Core analytics",
    ],
    cta: "Create a free account",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    cadence: "/ mo",
    blurb: "When the notes need a second reader — insights and Juvo AI.",
    features: [
      "Everything in Free",
      "Behavioural insights",
      "Juvo AI chat",
      "CSV / JSON export",
    ],
    cta: "Start on Pro later",
    featured: true,
  },
  {
    id: "super",
    name: "Super",
    price: "$39",
    cadence: "/ mo",
    blurb: "For the desk that already journals — reviews, sync, extra room.",
    features: [
      "Everything in Pro",
      "Unlimited reviews",
      "Broker sync when it ships",
      "Priority coaching context",
    ],
    cta: "Start on Super later",
    featured: false,
  },
];

export default function Pricing() {
  const router = useRouter();
  const reduce = useReducedMotion() ?? false;

  return (
    <HomeSection id="pricing">
      <SectionIntro
        kicker="Pricing"
        title={
          <>
            Free until the journal
            <span className="block text-slate-300">is a habit.</span>
          </>
        }
        description="Same tiers as in the app. Checkout isn’t live yet — create an account and you land on Free."
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:items-stretch">
        {plans.map((plan, index) => (
          <motion.article
            key={plan.id}
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.07, duration: 0.55, ease: homeEase }}
            className={cn(
              "flex h-full flex-col rounded-[1.7rem] border p-6",
              plan.featured
                ? "border-primary/35 bg-primary/10 shadow-[0_24px_80px_rgba(0,212,255,0.08)] lg:-translate-y-2"
                : "border-white/10 bg-[#09111f]/90",
              plan.id === "pro" && "order-first lg:order-none",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{plan.name}</p>
                <p className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-white">
                    {plan.price}
                  </span>
                  <span className="text-sm text-slate-500">{plan.cadence}</span>
                </p>
              </div>
              {plan.featured ? (
                <span className="rounded-full border border-primary/30 bg-primary/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Daily desk
                </span>
              ) : (
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  {plan.id === "free" ? "Start" : "Later"}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-300">{plan.blurb}</p>

            <ul className="mt-6 flex-1 space-y-2.5">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.featured ? "primary" : "onDark"}
              className="mt-8 w-full"
              onClick={() => router.push("/auth/register")}
            >
              {plan.cta}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.article>
        ))}
      </div>
    </HomeSection>
  );
}
