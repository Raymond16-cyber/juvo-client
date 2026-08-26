"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useRouter } from "next/navigation";

import { useOnboardingStore } from "@/stores/onboarding.store";

import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import OnboardingNavigation from "@/components/onboarding/OnboardingNavigation";

import LocationStep from "@/components/onboarding/LocationStep";
import ExperienceStep from "@/components/onboarding/ExperienceStep";
import InstrumentsStep from "@/components/onboarding/InstrumentsStep";
import ChallengesStep from "@/components/onboarding/ChallengesStep";

import NotificationsStep from "@/components/onboarding/NotificationsStep";
import PreferencesStep from "@/components/onboarding/PreferenceStep";

export default function OnboardingPage() {
  const router = useRouter();
  const brandRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    currentStep,
    isLoading,
    error,
    instruments,
    country,
    timezone,
    experienceLevel,
    preferredCurrency,
    nextStep,
    previousStep,
    submitOnboarding,
  } = useOnboardingStore();

  const totalSteps = 6;

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        brandRef.current,
        { autoAlpha: 0, y: 24, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" },
      );
      gsap.fromTo(
        panelRef.current,
        { autoAlpha: 0, x: 24 },
        { autoAlpha: 1, x: 0, duration: 0.7, ease: "power3.out", delay: 0.1 },
      );
      gsap.to(".market-tape-track", {
        xPercent: -50,
        duration: 18,
        ease: "none",
        repeat: -1,
      });
    });

    return () => context.revert();
  }, []);

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!country.trim()) {
          return "Please enter your country.";
        }

        if (!timezone.trim()) {
          return "Please enter your timezone.";
        }

        break;

      case 1:
        if (!experienceLevel) {
          return "Please select your experience level.";
        }

        break;

      case 2:
        if (instruments.length === 0) {
          return "Please select at least one instrument.";
        }

        break;

      case 4:
        if (!preferredCurrency) {
          return "Please select your preferred currency.";
        }

        break;
    }

    return null;
  };

  const handleNext = async () => {
    const validationError = validateStep();

    if (validationError) {
      // Ideally move this into Zustand
      // so every component shares the error.
      alert(validationError);
      return;
    }

    if (currentStep === totalSteps - 1) {
      try {
        await submitOnboarding();

        router.replace("/home/dashboard");
      } catch {
        return;
      }

      return;
    }

    nextStep();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <LocationStep />;

      case 1:
        return <ExperienceStep />;

      case 2:
        return <InstrumentsStep />;

      case 3:
        return <ChallengesStep />;

      case 4:
        return <PreferencesStep />;

      case 5:
        return <NotificationsStep />;

      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-background dark:text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl">
        {/* Left visual */}
        <div className="hidden flex-1 items-center justify-center lg:flex">
          <div ref={brandRef} className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-[120px] dark:bg-primary/10" />

            <div className="relative">
              <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-3xl font-bold text-primary shadow-xl shadow-slate-300/60 dark:bg-white dark:text-slate-950 dark:shadow-black/30">
                J
              </div>

              <p className="text-5xl font-bold tracking-tight text-slate-950 dark:text-white">
                JUVO
              </p>

              <p className="mt-4 max-w-sm text-slate-500 dark:text-slate-400">
                Trade with intention.
                <br />
                Journal with discipline.
                <br />
                Grow with data.
              </p>

              <div className="mt-10 max-w-md overflow-hidden rounded-full border border-slate-200 bg-white/80 py-2 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
                <div className="market-tape-track flex w-max gap-6 px-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                  {[
                    "XAU/USD +1.8%",
                    "NAS100 +0.7%",
                    "EUR/USD -0.2%",
                    "BTC/USD +3.4%",
                    "US30 +0.5%",
                    "GBP/JPY +0.9%",
                    "XAU/USD +1.8%",
                    "NAS100 +0.7%",
                    "EUR/USD -0.2%",
                    "BTC/USD +3.4%",
                    "US30 +0.5%",
                    "GBP/JPY +0.9%",
                  ].map((item, index) => (
                    <span key={`${item}-${index}`}>{item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="flex w-full max-w-xl flex-col justify-center px-6 py-12 lg:px-12">
          <div
            ref={panelRef}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-card sm:p-8"
          >
            <OnboardingProgress
              currentStep={currentStep}
              totalSteps={totalSteps}
            />

            {renderStep()}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/20 dark:bg-red-500/5">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            <OnboardingNavigation
              currentStep={currentStep}
              totalSteps={totalSteps}
              isLoading={isLoading}
              onBack={previousStep}
              onNext={handleNext}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
