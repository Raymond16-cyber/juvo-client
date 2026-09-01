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
      updatePreferences({ theme: next }).catch(() => undefined);
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
        className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10"
        aria-label={`Theme: ${preference}. Switch to ${next}`}
      >
        <Icon size={17} />
      </button>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-white/10">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => apply(option.value)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-white text-slate-950 shadow-sm dark:bg-primary dark:text-slate-950"
                : "text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            <Icon size={15} />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
