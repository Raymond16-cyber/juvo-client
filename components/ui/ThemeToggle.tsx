"use client";

import { useAuthStore } from "@/stores/auth.store";
import { ThemePreference, useThemeStore } from "@/stores/theme.store";
import { Monitor, Moon, Sun } from "lucide-react";

const options: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

type ThemeToggleProps = {
  compact?: boolean;
};

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const preference = useThemeStore((state) => state.preference);
  const setPreference = useThemeStore((state) => state.setPreference);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updatePreferences = useAuthStore((state) => state.updatePreferences);

  const apply = (next: ThemePreference) => {
    setPreference(next);
    if (isAuthenticated) {
      updatePreferences({ theme: next }, { silent: true }).catch(() => undefined);
    }
  };

  if (compact) {
    const next =
      preference === "light" ? "dark" : preference === "dark" ? "system" : "light";
    const Icon = options.find((option) => option.value === preference)?.icon || Sun;

    return (
      <button
        type="button"
        onClick={() => apply(next)}
        className="grid h-10 w-10 place-items-center rounded-control border border-border bg-card text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
        aria-label={`Theme: ${preference}. Switch to ${next}`}
      >
        <Icon size={17} />
      </button>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 rounded-control border border-border bg-slate-50 p-1 dark:bg-white/[0.04]">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => apply(option.value)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-[0.5rem] px-2.5 py-1.5 text-xs font-semibold transition ${
              isActive
                ? "bg-slate-950 text-white dark:bg-primary dark:text-slate-950"
                : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Icon size={14} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
