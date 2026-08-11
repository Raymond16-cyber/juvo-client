"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import images from "@/constants/images.service";
import Button from "@/components/ui/Button";
import { ArrowRight, Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why JUVO", href: "#why-juvo" },
  { label: "Insights", href: "#insights" },
  { label: "Pricing", href: "#pricing" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollToTarget(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#050816]/80 shadow-[0_12px_40px_rgba(2,6,23,0.5)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:py-5">
        <a href="#top" className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-1.5 shadow-lg shadow-cyan-950/30">
            <Image
              src={images.appLogo}
              alt="JUVO logo"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200/80">
              JUVO
            </p>
            <p className="text-xs text-slate-400">Building Discipline.</p>
          </div>
        </a>

        <div className="hidden items-center gap-4 lg:flex">
          <nav
            className="flex items-center gap-8 text-sm text-slate-300"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <Button
            variant="primary"
            onClick={() => scrollToTarget("pricing")}
            className="min-w-[138px]"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="ghost"
          onClick={() => setMobileOpen((value) => !value)}
          className="lg:hidden px-4 py-2"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-7xl px-4 lg:hidden"
          >
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#07101d]/95 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <nav className="flex flex-col gap-2 text-sm text-slate-200">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-2xl px-4 py-3 transition-colors hover:bg-white/6 hover:text-white"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <Button
                variant="primary"
                onClick={() => {
                  setMobileOpen(false);
                  scrollToTarget("pricing");
                }}
                className="mt-4 w-full"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
