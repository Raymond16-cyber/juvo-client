import { create } from "zustand";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "juvo-theme";

function getSystemTheme() {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function resolveTheme(preference: ThemePreference) {
  return preference === "system" ? getSystemTheme() : preference;
}

export function applyThemeClass(preference: ThemePreference) {
  if (typeof document === "undefined") return;
  const resolved = resolveTheme(preference);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

interface ThemeState {
  preference: ThemePreference;
  resolved: "light" | "dark";
  setPreference: (preference: ThemePreference) => void;
  hydrate: (preference?: ThemePreference | null) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  preference: "system",
  resolved: "light",
  setPreference: (preference) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, preference);
    }
    applyThemeClass(preference);
    set({ preference, resolved: resolveTheme(preference) });
  },
  hydrate: (preference) => {
    const stored =
      preference ||
      (typeof window !== "undefined"
        ? (localStorage.getItem(STORAGE_KEY) as ThemePreference | null)
        : null) ||
      "system";
    const next =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";
    applyThemeClass(next);
    set({ preference: next, resolved: resolveTheme(next) });
  },
}));
