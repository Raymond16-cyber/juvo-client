"use client";

import Image from "next/image";
import { ArrowUpRight, Linkedin, X } from "lucide-react";
import authorImage from "@/assets/images/authorImage.png";
import { HomeSection, homeEase } from "./shared";
import { motion, useReducedMotion } from "framer-motion";

export default function AboutAuthor() {
  const reduce = useReducedMotion() ?? false;

  return (
    <HomeSection id="about-author" className="overflow-hidden">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65, ease: homeEase }}
        className="relative overflow-hidden rounded-[2rem] border border-cyan-400/15 bg-gradient-to-br from-cyan-400/10 via-[#09111f]/95 to-[#09111f]/95 p-6 shadow-[0_28px_90px_rgba(2,6,23,0.42)] sm:p-8 lg:p-12"
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div className="mx-auto w-full max-w-sm">
            <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 p-2 shadow-[0_20px_60px_rgba(2,6,23,0.45)]">
              <Image
                src={authorImage}
                alt="Uchenna Raymond, founder of JUVO"
                fill
                sizes="(max-width: 1024px) 80vw, 320px"
                className="rounded-[1.35rem] object-cover"
              />
            </div>
          </div>

          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/80">
              About the author
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Built for the trader behind the numbers.
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-300 sm:text-lg">
              I&apos;m Uchenna Raymond, the founder and builder behind JUVO. I
              created JUVO to make the part of trading that happens after the
              chart easier to take seriously: reflection, accountability, and
              the steady work of building discipline.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-400">
              JUVO is designed to feel less like a spreadsheet and more like a
              reliable training ground for better decisions, one session at a
              time.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="https://x.com/Ucheraymond014"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
                Follow the journey
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.linkedin.com/in/ikechukwu-r-9b2080336/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
              >
                <Linkedin className="h-4 w-4" />
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </HomeSection>
  );
}
