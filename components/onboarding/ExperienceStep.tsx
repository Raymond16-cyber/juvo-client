"use client";

import OptionCard from "./OptionCard";

import { EXPERIENCE_LEVELS, TRADING_STYLES } from "@/constants/onboarding";

import { useOnboardingStore } from "@/stores/onboarding.store";

export default function ExperienceStep() {
  const { experienceLevel, tradingStyle, updateField } = useOnboardingStore();

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary">Step 2 of 6</p>

        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
          Tell us about your trading
        </h1>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          This helps us personalize your JUVO experience.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="mb-3 text-sm font-medium text-slate-950 dark:text-white">
            Experience level
          </h2>

          <div className="space-y-3">
            {EXPERIENCE_LEVELS.map((item) => (
              <OptionCard
                key={item.value}
                label={item.label}
                description={item.description}
                selected={experienceLevel === item.value}
                onClick={() => updateField("experienceLevel", item.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-slate-950 dark:text-white">
            Trading style
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {TRADING_STYLES.map((item) => (
              <OptionCard
                key={item.value}
                label={item.label}
                selected={tradingStyle === item.value}
                onClick={() => updateField("tradingStyle", item.value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
