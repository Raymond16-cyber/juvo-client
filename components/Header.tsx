"use client";

import BrandLogo from "@/components/BrandLogo";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/stores/auth.store";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Why JUVO", href: "#why-juvo" },
  { label: "Insights", href: "#insights" },
  { label: "About", href: "#about-author" },
  { label: "Pricing", href: "#pricing" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasStoredToken, setHasStoredToken] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith("/auth");
  const hasCheckedAuth = useAuthStore((state) => state.hasCheckedAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const showDashboardAction =
    isAuthenticated || (!hasCheckedAuth && hasStoredToken);
  const dashboardPath = user?.onboarding?.completed
    ? "/home/dashboard"
    : "/home/onboarding";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setHasStoredToken(Boolean(window.localStorage.getItem("token")));
    });
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/90 bg-white/95 shadow-juvo dark:border-white/10 dark:bg-[#050816]/95"
          : "border-b border-slate-200/80 bg-white/90 dark:border-white/10 dark:bg-[#050816]/90"
      }`}
    >
      <div className="mx-auto flex max-w-[90rem] items-center justify-between px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
        <a
          href={isAuthPage ? "/" : "#top"}
          className="flex items-center gap-3 rounded-control outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="JUVO home"
        >
          <BrandLogo size={44} plateClassName="rounded-lg" />
          <div className="min-w-0">
            <p className="text-[15px] font-bold leading-none tracking-[0.18em] text-slate-950 dark:text-white">
              JUVO
            </p>
            <p className="mt-1.5 text-xs leading-none text-slate-500 dark:text-slate-400">
              Building Discipline
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-3 lg:flex">
          {!isAuthPage ? (
            <nav
              className="mr-1 flex items-center gap-8 text-sm text-slate-600 dark:text-slate-300"
              aria-label="Main navigation"
            >
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="transition-colors duration-200 hover:text-slate-950 dark:hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          ) : null}

          <ThemeToggle compact />

          {showDashboardAction ? (
            <Button
              variant="primary"
              onClick={() => router.push(dashboardPath)}
              className="min-w-[138px]"
            >
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                className="min-w-[110px] dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                onClick={() => router.push("/auth/login")}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push("/auth/register")}
                className="min-w-[138px]"
              >
                Register
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle compact />
          <Button
            variant="secondary"
            onClick={() => setMobileOpen((value) => !value)}
            className="px-4 py-2 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-[90rem] px-4 sm:px-5 lg:hidden lg:px-6"
          >
            <div className="overflow-hidden rounded-card border border-slate-200 bg-white p-4 shadow-juvo dark:border-white/10 dark:bg-[#07101d]/95">
              {!isAuthPage ? (
                <nav className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-2xl px-4 py-3 transition-colors hover:bg-slate-50 hover:text-slate-950 dark:hover:bg-white/6 dark:hover:text-white"
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>
              ) : null}

              {showDashboardAction ? (
                <Button
                  variant="primary"
                  onClick={() => {
                    setMobileOpen(false);
                    router.push(dashboardPath);
                  }}
                  className="mt-4 w-full"
                >
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/auth/login");
                    }}
                    className="mt-4 w-full dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/auth/register");
                    }}
                    className="mt-3 w-full"
                  >
                    Register
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
