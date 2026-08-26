"use client";

import { useOnboardingStore } from "@/stores/onboarding.store";

export default function LocationStep() {
  const { country, timezone, updateField } = useOnboardingStore();

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary">Step 1 of 6</p>

        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
          Where are you based?
        </h1>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          This helps JUVO personalize your trading calendar, timezone and
          reminders.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Country
          </label>

          <input
            value={country}
            onChange={(e) => updateField("country", e.target.value)}
            placeholder="Nigeria"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Timezone
          </label>

          <input
            value={timezone}
            onChange={(e) => updateField("timezone", e.target.value)}
            placeholder="Africa/Lagos"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>
      </div>
    </div>
  );
}
