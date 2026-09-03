"use client";

import Image from "next/image";
import { ArrowUpRight, Linkedin, Mail, X } from "lucide-react";
import images from "@/constants/images.service";

export default function Footer() {
  return (
    <footer className="border-t border-white/8 bg-[#040812]">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-xl">
            <a href="#top" className="inline-flex items-center gap-3">
              <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1.5">
                <Image
                  src={images.appLogo}
                  alt="JUVO logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                  JUVO
                </p>
                <p className="text-sm text-slate-400">Building Discipline.</p>
              </div>
            </a>

            <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300">
              JUVO is a premium trading journal and trader-development platform
              designed to help traders reflect, learn, and build discipline over
              time.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
              <a
                href="#features"
                className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/6"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/6"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/6"
              >
                FAQ
              </a>
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Roadmap"],
              },
              {
                title: "Company",
                links: ["About", "Contact", "Help Center"],
              },
              {
                title: "Resources",
                links: ["Trading Journal", "Trading Psychology", "Insights"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms"],
              },
            ].map((column) => (
              <div key={column.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {column.title}
                </p>
                <ul className="mt-4 space-y-3 text-sm text-slate-300">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="inline-flex items-center gap-1 transition hover:text-white"
                      >
                        {link}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/8 pt-8 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} JUVO. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <a
              href="https://x.com/Ucheraymond014"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition hover:text-white"
            >
              <X className="h-4 w-4" />
            </a>
            <a
              href="https://www.linkedin.com/in/ikechukwu-r-9b2080336/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition hover:text-white"
            >
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </a>
            <a
              href="mailto:uchennaraymond74@gmail.com"
              className="flex items-center gap-2 transition hover:text-white"
            >
              <Mail className="h-4 w-4" />
              uchennaraymond74@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
