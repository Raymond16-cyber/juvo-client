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
  ArrowUpRight,
  Bell,
  Check,
  CreditCard,
  Download,
  Flame,
  HelpCircle,
  KeyRound,
  Link2,
  LocateFixed,
  NotebookPen,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

type ExperienceLevel = "beginner" | "intermediate" | "advanced" | "professional";
type TradingStyle =
  | "scalping"
  | "day_trading"
  | "swing_trading"
  | "position_trading";

type SettingsSectionId =
  | "profile"
  | "trading"
  | "appearance"
  | "rhythm"
  | "account"
  | "data";

const SECTIONS: Array<{
  id: SettingsSectionId;
  label: string;
  description: string;
}> = [
  {
    id: "profile",
    label: "Profile",
    description: "Identity, location, and currency defaults",
  },
  {
    id: "trading",
    label: "Trading identity",
    description: "Style, markets, and challenges",
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Theme and workspace look",
  },
  {
    id: "rhythm",
    label: "Review rhythm",
    description: "Week start and journal reminders",
  },
  {
    id: "account",
    label: "Account & plan",
    description: "Security, billing, and AI access",
  },
  {
    id: "data",
    label: "Data & links",
    description: "Export, brokers, and help",
  },
];

const labelize = (value: string) =>
  value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function planLabel(plan?: string) {
  if (!plan) return "Free";
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}

function statusLabel(status?: string) {
  if (!status) return "Free";
  return status.replaceAll("-", " ");
}

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const updatePreferences = useAuthStore((state) => state.updatePreferences);
  const isLoading = useAuthStore((state) => state.isLoading);
  const message = useAuthStore((state) => state.message);
  const error = useAuthStore((state) => state.error);
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);

  const [activeSection, setActiveSection] = useState<SettingsSectionId>("profile");
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
  const [reportingCurrency, setReportingCurrency] = useState(
    user?.preferences?.reportingCurrency ||
      user?.preferences?.preferredCurrency ||
      "USD",
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
  const [dirty, setDirty] = useState(false);

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
      setReportingCurrency(
        user.preferences?.reportingCurrency ||
          user.preferences?.preferredCurrency ||
          "USD",
      );
      setWeekStartsOn(user.preferences?.weekStartsOn || "monday");
      setNotificationsEnabled(user.preferences?.notifications?.enabled ?? true);
      setReminderTime(user.preferences?.notifications?.reminderTime || "08:00");
      if (user.preferences?.theme) setPreference(user.preferences.theme);
      setDirty(false);
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
      reportingCurrency,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [
    biggestChallenges.length,
    country,
    currency,
    experienceLevel,
    fullName,
    instruments.length,
    reportingCurrency,
    timezone,
    tradingStyle,
  ]);

  const initials = useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "J";
    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  }, [fullName]);

  const markDirty = () => setDirty(true);

  const toggleInstrument = (value: string) => {
    markDirty();
    setInstruments((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const toggleChallenge = (value: string) => {
    markDirty();
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
      reportingCurrency,
      weekStartsOn,
      notificationsEnabled,
      reminderTime,
      theme: preference,
    });
    setDirty(false);
  };

  const scrollToSection = (id: SettingsSectionId) => {
    setActiveSection(id);
    const node = document.getElementById(`settings-${id}`);
    node?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const plan = user?.subscription?.plan || "free";
  const planStatus = user?.subscription?.status || "free";
  const aiTrial = user?.entitlements?.aiTrial;
  const streak = user?.stats?.currentJournalStreak || 0;
  const totalJournals = user?.stats?.totalJournals || 0;
  const totalTrades = user?.stats?.totalTrades || 0;

  return (
    <DashboardShell>
      <form className="space-y-6" onSubmit={handleSave}>
        <PageHeader
          eyebrow="General"
          title="Settings"
          description="A control center for your trading identity, review rhythm, plan, and workspace."
          actions={
            <div className="flex flex-wrap items-center gap-3">
              {dirty ? (
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  Unsaved changes
                </span>
              ) : null}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save settings"}
              </Button>
            </div>
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

        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <Card className="overflow-hidden p-0">
              <div className="bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-slate-950 dark:text-white">
                      {fullName || "JUVO Trader"}
                    </p>
                    <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                      {user?.email || "Signed in"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    {planLabel(plan)} · {statusLabel(planStatus)}
                  </span>
                  <span className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                    {labelize(tradingStyle)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-slate-200 p-4 dark:border-white/10">
                <StatChip icon={Flame} label="Streak" value={String(streak)} />
                <StatChip
                  icon={NotebookPen}
                  label="Journals"
                  value={String(totalJournals)}
                />
                <StatChip
                  icon={SlidersHorizontal}
                  label="Trades"
                  value={String(totalTrades)}
                />
              </div>

              <div className="border-t border-slate-200 px-4 py-4 dark:border-white/10">
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
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${profileCompleteness}%` }}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-3">
              <nav className="space-y-1" aria-label="Settings sections">
                {SECTIONS.map((section) => {
                  const active = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        "flex w-full flex-col rounded-xl px-3 py-2.5 text-left transition",
                        active
                          ? "bg-primary/15 text-slate-950 dark:text-white"
                          : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.04]",
                      )}
                    >
                      <span className="text-sm font-semibold">{section.label}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {section.description}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </aside>

          <div className="space-y-6">
            <section id="settings-profile" className="scroll-mt-6">
              <SettingsSection
                icon={UserRound}
                title="Profile"
                description="Basic identity and local context for dates, reminders, and reports."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <input
                      className={controlClassName}
                      value={fullName}
                      onChange={(event) => {
                        markDirty();
                        setFullName(event.target.value);
                      }}
                      placeholder="Full name"
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      className={controlClassName}
                      value={user?.email || ""}
                      disabled
                      readOnly
                    />
                  </Field>
                  <Field label="Country">
                    <input
                      className={controlClassName}
                      value={country}
                      onChange={(event) => {
                        markDirty();
                        setCountry(event.target.value);
                      }}
                      placeholder="Country"
                    />
                  </Field>
                  <Field
                    label="Timezone"
                    action={
                      <button
                        type="button"
                        onClick={() => {
                          markDirty();
                          setTimezone(detectTimezone());
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
                      >
                        <LocateFixed size={13} />
                        Detect
                      </button>
                    }
                  >
                    <input
                      className={controlClassName}
                      value={timezone}
                      onChange={(event) => {
                        markDirty();
                        setTimezone(event.target.value);
                      }}
                      placeholder="Africa/Lagos"
                    />
                  </Field>
                  <Field label="Account currency">
                    <select
                      className={controlClassName}
                      value={currency}
                      onChange={(event) => {
                        markDirty();
                        const next = event.target.value;
                        setCurrency(next);
                        if (reportingCurrency === currency) {
                          setReportingCurrency(next);
                        }
                      }}
                    >
                      {CURRENCIES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Reporting currency">
                    <select
                      className={controlClassName}
                      value={reportingCurrency}
                      onChange={(event) => {
                        markDirty();
                        setReportingCurrency(event.target.value);
                      }}
                    >
                      {CURRENCIES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      Used for analytics and multi-account totals.
                    </p>
                  </Field>
                </div>
              </SettingsSection>
            </section>

            <section id="settings-trading" className="scroll-mt-6">
              <SettingsSection
                icon={Sparkles}
                title="Trading identity"
                description="These fields help JUVO frame analytics and AI review around how you actually trade."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Experience">
                    <select
                      className={controlClassName}
                      value={experienceLevel}
                      onChange={(event) => {
                        markDirty();
                        setExperienceLevel(
                          event.target.value as ExperienceLevel,
                        );
                      }}
                    >
                      {EXPERIENCE_LEVELS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Trading style">
                    <select
                      className={controlClassName}
                      value={tradingStyle}
                      onChange={(event) => {
                        markDirty();
                        setTradingStyle(event.target.value as TradingStyle);
                      }}
                    >
                      {TRADING_STYLES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="mt-6 space-y-5">
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
            </section>

            <section id="settings-appearance" className="scroll-mt-6">
              <SettingsSection
                icon={SlidersHorizontal}
                title="Appearance"
                description="Choose how JUVO looks across the dashboard and journal."
              >
                <ThemeToggle />
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Theme changes apply immediately. Save settings to keep them
                  synced to your account.
                </p>
              </SettingsSection>
            </section>

            <section id="settings-rhythm" className="scroll-mt-6">
              <SettingsSection
                icon={Bell}
                title="Review rhythm"
                description="Set the weekly calendar and reminder behavior JUVO should respect."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Week starts">
                    <select
                      className={controlClassName}
                      value={weekStartsOn}
                      onChange={(event) => {
                        markDirty();
                        setWeekStartsOn(
                          event.target.value as "sunday" | "monday",
                        );
                      }}
                    >
                      {WEEK_START_OPTIONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Reminder time">
                    <input
                      className={controlClassName}
                      type="time"
                      value={reminderTime}
                      onChange={(event) => {
                        markDirty();
                        setReminderTime(event.target.value);
                      }}
                    />
                  </Field>
                </div>

                <ToggleRow
                  icon={Bell}
                  title="Journal reminders"
                  description={
                    notificationsEnabled
                      ? "Enabled for your review routine"
                      : "Paused"
                  }
                  checked={notificationsEnabled}
                  onChange={(next) => {
                    markDirty();
                    setNotificationsEnabled(next);
                  }}
                />
              </SettingsSection>
            </section>

            <section id="settings-account" className="scroll-mt-6">
              <SettingsSection
                icon={ShieldCheck}
                title="Account & plan"
                description="Security details, billing status, and JUVO AI access at a glance."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoTile
                    label="Signed in with"
                    value={labelize(user?.authProvider || "local")}
                  />
                  <InfoTile
                    label="Email status"
                    value={
                      user?.emailVerified ? "Verified" : "Verification pending"
                    }
                    tone={user?.emailVerified ? "good" : "warn"}
                  />
                  <InfoTile label="Current plan" value={planLabel(plan)} />
                  <InfoTile
                    label="Plan status"
                    value={statusLabel(planStatus)}
                  />
                </div>

                <div className="mt-5 grid gap-3">
                  <LinkCard
                    href="/home/general/subscriptions"
                    icon={CreditCard}
                    title="Manage subscription"
                    body={`${planLabel(plan)} plan · ${statusLabel(planStatus)}. Upgrade, renew, or open billing.`}
                  />
                  <LinkCard
                    href="/home/ai/chat"
                    icon={Sparkles}
                    title="JUVO AI access"
                    body={
                      aiTrial?.status === "active"
                        ? "Your 3-day AI trial is active."
                        : aiTrial?.status === "expired"
                          ? "Your AI trial has ended. Pro or Super unlocks JUVO AI."
                          : plan === "free"
                            ? "Start a one-time 3-day AI trial, or upgrade to Pro/Super."
                            : "Your plan includes JUVO AI coaching and screenshot review."
                    }
                  />
                  <LinkCard
                    href="/auth/forgot-password"
                    icon={KeyRound}
                    title="Reset password"
                    body="Open the password reset flow if you need a new sign-in credential."
                  />
                </div>
              </SettingsSection>
            </section>

            <section id="settings-data" className="scroll-mt-6">
              <SettingsSection
                icon={Download}
                title="Data & links"
                description="Jump to export, broker connections, and support without leaving settings."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <LinkCard
                    href="/home/accounts/export"
                    icon={Download}
                    title="Export journals"
                    body="Download your trading history when your plan includes data export."
                  />
                  <LinkCard
                    href="/home/accounts/broker"
                    icon={Link2}
                    title="Broker connections"
                    body="Connect MetaTrader or cTrader accounts for synced fills."
                  />
                  <LinkCard
                    href="/home/general/help"
                    icon={HelpCircle}
                    title="Help center"
                    body="Guides, troubleshooting, and product support."
                  />
                  <LinkCard
                    href="/home/general/juvo-tutorials"
                    icon={NotebookPen}
                    title="JUVO tutorials"
                    body="Short walkthroughs for journaling, analytics, and AI."
                  />
                </div>
              </SettingsSection>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.03]">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {dirty
                  ? "You have unsaved settings on this page."
                  : "All settings on this page are saved."}
              </p>
              <Button type="submit" disabled={isLoading || !dirty}>
                {isLoading ? "Saving..." : "Save settings"}
              </Button>
            </div>
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
}: {
  children: React.ReactNode;
  description?: string;
  icon: React.ElementType;
  title: string;
}) {
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

function Field({
  label,
  children,
  action,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
      <span className="mb-2 flex items-center justify-between gap-3">
        <span>{label}</span>
        {action}
      </span>
      {children}
    </label>
  );
}

function ChipGroup({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
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

function ToggleRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="mt-5 flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left dark:border-white/10 dark:bg-white/[0.04]"
    >
      <span className="flex items-center gap-3">
        <Icon size={18} className="text-primary" />
        <span>
          <span className="block text-sm font-bold text-slate-950 dark:text-white">
            {title}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {description}
          </span>
        </span>
      </span>
      <span
        className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
          checked ? "bg-primary" : "bg-slate-300 dark:bg-white/20"
        }`}
      >
        <span
          className={`h-5 w-5 rounded-full bg-white transition ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-2 py-2 text-center dark:bg-white/[0.04]">
      <Icon size={14} className="mx-auto text-primary" />
      <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
        {value}
      </p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

function InfoTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-bold",
          tone === "good" && "text-emerald-600 dark:text-emerald-300",
          tone === "warn" && "text-amber-700 dark:text-amber-300",
          tone === "neutral" && "text-slate-950 dark:text-white",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function LinkCard({
  href,
  icon: Icon,
  title,
  body,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-primary dark:border-white/10 dark:bg-white/[0.03]"
    >
      <span className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
          <Icon size={16} />
        </span>
        <span>
          <span className="block text-sm font-bold text-slate-950 dark:text-white">
            {title}
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
            {body}
          </span>
        </span>
      </span>
      <ArrowUpRight
        size={16}
        className="mt-1 shrink-0 text-slate-400 transition group-hover:text-primary"
      />
    </Link>
  );
}
