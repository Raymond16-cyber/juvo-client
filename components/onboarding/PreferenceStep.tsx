"use client";

import OptionCard from "./OptionCard";

import { THEMES, CURRENCIES, WEEK_START_OPTIONS } from "@/constants/onboarding";

import { useOnboardingStore } from "@/stores/onboarding.store";

export default function PreferencesStep() {
  const { theme, preferredCurrency, weekStartsOn, updateField } =
    useOnboardingStore();

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary">Step 5 of 6</p>

        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
          Personalize JUVO
        </h1>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Choose how you&apos;d like JUVO to work for you.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="mb-3 text-sm font-medium text-slate-950 dark:text-white">
            Theme
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((item) => (
              <OptionCard
                key={item.value}
                label={item.label}
                selected={theme === item.value}
                onClick={() => updateField("theme", item.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-slate-950 dark:text-white">
            Preferred currency
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {CURRENCIES.map((item) => (
              <OptionCard
                key={item.value}
                label={item.label}
                selected={preferredCurrency === item.value}
                onClick={() => updateField("preferredCurrency", item.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-medium text-slate-950 dark:text-white">
            Week starts on
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {WEEK_START_OPTIONS.map((item) => (
              <OptionCard
                key={item.value}
                label={item.label}
                selected={weekStartsOn === item.value}
                onClick={() => updateField("weekStartsOn", item.value)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
