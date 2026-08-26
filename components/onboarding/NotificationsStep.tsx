"use client";

import { useOnboardingStore } from "@/stores/onboarding.store";

export default function NotificationsStep() {
  const { notificationsEnabled, reminderTime, updateField } =
    useOnboardingStore();

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-primary">Step 6 of 6</p>

        <h1 className="text-3xl font-semibold text-slate-950 dark:text-white">
          Stay accountable
        </h1>

        <p className="mt-3 text-slate-500 dark:text-slate-400">
          Let JUVO remind you to journal and stay consistent.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-950 dark:text-white">
              Notifications
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Receive reminders from JUVO.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              updateField("notificationsEnabled", !notificationsEnabled)
            }
            className={`relative h-7 w-12 rounded-full transition ${
              notificationsEnabled
                ? "bg-primary"
                : "bg-slate-200 dark:bg-white/10"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                notificationsEnabled ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {notificationsEnabled && (
        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Reminder time
          </label>

          <input
            type="time"
            value={reminderTime}
            onChange={(e) => updateField("reminderTime", e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-primary dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </div>
      )}
    </div>
  );
}
