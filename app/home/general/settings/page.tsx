"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  CHALLENGES,
  CURRENCIES,
  EXPERIENCE_LEVELS,
  INSTRUMENTS,
  TRADING_STYLES,
  WEEK_START_OPTIONS,
} from "@/constants/onboarding";
import { cn, controlClassName } from "@/lib/ui";
import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import {
  Bell,
  Check,
  Clock3,
  Globe2,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "professional";
type TradingStyle =
  | "scalping"
  | "day_trading"
  | "swing_trading"
  | "position_trading";

type SettingsSectionProps = {
  children: React.ReactNode;
  description?: string;
  icon: React.ElementType;
  title: string;
};

type ChipGroupProps = {
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
};

const labelize = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

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
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    user?.profile?.experienceLevel || "beginner",
  );
  const [tradingStyle, setTradingStyle] = useState<TradingStyle>(
    user?.profile?.tradingStyle || "day_trading",
  );
  const [instruments, setInstruments] = useState<string[]>(
    user?.profile?.instruments || [],
  );
  const [biggestChallenges, setBiggestChallenges] = useState<string[]>(
    user?.profile?.biggestChallenges || [],
  );
  const [currency, setCurrency] = useState(
    user?.preferences?.preferredCurrency || "USD",
  );
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
    queueMicrotask(() => {
      setFullName(user.fullName || "");
      setCountry(user.profile?.country || "");
      setTimezone(user.profile?.timezone || "UTC");
      setExperienceLevel(user.profile?.experienceLevel || "beginner");
      setTradingStyle(user.profile?.tradingStyle || "day_trading");
      setInstruments(user.profile?.instruments || []);
      setBiggestChallenges(user.profile?.biggestChallenges || []);
      setCurrency(user.preferences?.preferredCurrency || "USD");
      setWeekStartsOn(user.preferences?.weekStartsOn || "monday");
      setNotificationsEnabled(user.preferences?.notifications?.enabled ?? true);
      setReminderTime(user.preferences?.notifications?.reminderTime || "08:00");
      if (user.preferences?.theme) setPreference(user.preferences.theme);
    });
  }, [setPreference, user]);

  const profileCompleteness = useMemo(() => {
    const checks = [
      fullName,
      country,
      timezone,
      experienceLevel,
      tradingStyle,
      instruments.length,
      biggestChallenges.length,
      currency,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [
    biggestChallenges.length,
    country,
    currency,
    experienceLevel,
    fullName,
    instruments.length,
    timezone,
    tradingStyle,
  ]);

  const toggleInstrument = (value: string) => {
    setInstruments((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const toggleChallenge = (value: string) => {
    setBiggestChallenges((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updatePreferences({
      fullName,
      country,
      timezone,
      experienceLevel,
      tradingStyle,
      instruments,
      biggestChallenges,
      preferredCurrency: currency,
      weekStartsOn,
      notificationsEnabled,
      reminderTime,
      theme: preference,
    });
  };

  return (
    <DashboardShell>
      <form className="space-y-6" onSubmit={handleSave}>
        <PageHeader
          eyebrow="General"
          title="Settings"
          description="Keep JUVO aligned with your trading identity, review rhythm, and workspace preferences."
          actions={
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save settings"}
            </Button>
          }
        />

        {(message || error) && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              error
                ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {error || message}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <UserRound size={24} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold text-slate-950 dark:text-white">
                    {fullName || "JUVO Trader"}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {labelize(tradingStyle)} · {currency}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Profile strength
                  </span>
                  <span className="font-bold text-slate-950 dark:text-white">
                    {profileCompleteness}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${profileCompleteness}%` }}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="text-primary" size={20} />
                <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                  Appearance
                </h2>
              </div>
              <div className="mt-4">
                <ThemeToggle />
              </div>
            </Card>
          </aside>

          <div className="space-y-6">
            <SettingsSection
              icon={UserRound}
              title="Profile"
              description="Basic identity and local context for dates, reminders, and reports."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Full name
                  <input
                    className={`mt-2 ${controlClassName}`}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Full name"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Country
                  <input
                    className={`mt-2 ${controlClassName}`}
                    value={country}
                    onChange={(event) => setCountry(event.target.value)}
                    placeholder="Country"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Timezone
                  <input
                    className={`mt-2 ${controlClassName}`}
                    value={timezone}
                    onChange={(event) => setTimezone(event.target.value)}
                    placeholder="Africa/Lagos"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Preferred currency
                  <select
                    className={`mt-2 ${controlClassName}`}
                    value={currency}
                    onChange={(event) => setCurrency(event.target.value)}
                  >
                    {CURRENCIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </SettingsSection>

            <SettingsSection
              icon={Globe2}
              title="Trading Identity"
              description="These fields help JUVO frame analytics and AI review around how you actually trade."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Experience
                  <select
                    className={`mt-2 ${controlClassName}`}
                    value={experienceLevel}
                    onChange={(event) =>
                      setExperienceLevel(event.target.value as ExperienceLevel)
                    }
                  >
                    {EXPERIENCE_LEVELS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Trading style
                  <select
                    className={`mt-2 ${controlClassName}`}
                    value={tradingStyle}
                    onChange={(event) =>
                      setTradingStyle(event.target.value as TradingStyle)
                    }
                  >
                    {TRADING_STYLES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Markets
                  </p>
                  <ChipGroup
                    items={INSTRUMENTS}
                    selected={instruments}
                    onToggle={toggleInstrument}
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Main challenges
                  </p>
                  <ChipGroup
                    items={CHALLENGES}
                    selected={biggestChallenges}
                    onToggle={toggleChallenge}
                  />
                </div>
              </div>
            </SettingsSection>

            <SettingsSection
              icon={Clock3}
              title="Review Rhythm"
              description="Set the weekly calendar and reminder behavior JUVO should respect."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Week starts
                  <select
                    className={`mt-2 ${controlClassName}`}
                    value={weekStartsOn}
                    onChange={(event) =>
                      setWeekStartsOn(event.target.value as "sunday" | "monday")
                    }
                  >
                    {WEEK_START_OPTIONS.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Reminder time
                  <input
                    className={`mt-2 ${controlClassName}`}
                    type="time"
                    value={reminderTime}
                    onChange={(event) => setReminderTime(event.target.value)}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => setNotificationsEnabled((current) => !current)}
                className="mt-5 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left dark:border-white/10 dark:bg-white/[0.04]"
              >
                <span className="flex items-center gap-3">
                  <Bell size={18} className="text-primary" />
                  <span>
                    <span className="block text-sm font-bold text-slate-950 dark:text-white">
                      Journal reminders
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {notificationsEnabled
                        ? "Enabled for your review routine"
                        : "Paused"}
                    </span>
                  </span>
                </span>
                <span
                  className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
                    notificationsEnabled
                      ? "bg-primary"
                      : "bg-slate-300 dark:bg-white/20"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white transition ${
                      notificationsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            </SettingsSection>
          </div>
        </div>
      </form>
    </DashboardShell>
  );
}

function SettingsSection({
  children,
  description,
  icon: Icon,
  title,
}: SettingsSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
          <Icon size={19} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function ChipGroup({ items, selected, onToggle }: ChipGroupProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map((item) => {
        const active = selected.includes(item);
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
              active
                ? "border-primary bg-primary/15 text-slate-950 dark:text-white"
                : "border-slate-200 bg-white text-slate-500 hover:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
            )}
          >
            {active ? <Check size={14} /> : null}
            {labelize(item)}
          </button>
        );
      })}
    </div>
  );
}
