"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { CURRENCIES, WEEK_START_OPTIONS } from "@/constants/onboarding";
import { controlClassName } from "@/lib/ui";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import { FormEvent, useEffect, useState } from "react";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const updatePreferences = useAuthStore((state) => state.updatePreferences);
  const isLoading = useAuthStore((state) => state.isLoading);
  const message = useAuthStore((state) => state.message);
  const error = useAuthStore((state) => state.error);
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [country, setCountry] = useState(user?.profile?.country || "");
  const [timezone, setTimezone] = useState(user?.profile?.timezone || "UTC");
  const [currency, setCurrency] = useState(user?.preferences?.preferredCurrency || "USD");
  const [weekStartsOn, setWeekStartsOn] = useState<"sunday" | "monday">(
    user?.preferences?.weekStartsOn || "monday",
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notifications?.enabled ?? true,
  );
  const [reminderTime, setReminderTime] = useState(
    user?.preferences?.notifications?.reminderTime || "08:00",
  );

  useEffect(() => {
    fetchCurrentUser().catch(() => undefined);
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName || "");
    setCountry(user.profile?.country || "");
    setTimezone(user.profile?.timezone || "UTC");
    setCurrency(user.preferences?.preferredCurrency || "USD");
    setWeekStartsOn(user.preferences?.weekStartsOn || "monday");
    setNotificationsEnabled(user.preferences?.notifications?.enabled ?? true);
    setReminderTime(user.preferences?.notifications?.reminderTime || "08:00");
    if (user.preferences?.theme) setPreference(user.preferences.theme);
  }, [setPreference, user]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updatePreferences({
      fullName,
      country,
      timezone,
      preferredCurrency: currency,
      weekStartsOn: weekStartsOn as "sunday" | "monday",
      notificationsEnabled,
      reminderTime,
      theme: preference,
    });
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <PageHeader
          eyebrow="General"
          title="Settings"
          description="Theme, timezone, and reminders — keep Juvo comfortable in light and dark."
        />

        <Card className="p-6">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Appearance</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Light for daytime review. Dark for late sessions. System follows the OS.
          </p>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </Card>

        <form onSubmit={handleSave}>
          <Card className="space-y-4 p-6">
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Profile</h2>
            {(message || error) && (
              <p
                className={`rounded-2xl px-3 py-2 text-sm ${
                  error
                    ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                    : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {error || message}
              </p>
            )}
            <input
              className={controlClassName}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className={controlClassName}
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                placeholder="Country"
              />
              <input
                className={controlClassName}
                value={timezone}
                onChange={(event) => setTimezone(event.target.value)}
                placeholder="Timezone"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                className={controlClassName}
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
              >
                {CURRENCIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <select
                className={controlClassName}
                value={weekStartsOn}
                onChange={(event) =>
                  setWeekStartsOn(event.target.value as "sunday" | "monday")
                }
              >
                {WEEK_START_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    Week starts {item.label}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-white/[0.04]">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Journal reminders
              </span>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(event) => setNotificationsEnabled(event.target.checked)}
              />
            </label>
            <input
              className={controlClassName}
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save settings"}
            </Button>
          </Card>
        </form>
      </div>
    </DashboardShell>
  );
}
