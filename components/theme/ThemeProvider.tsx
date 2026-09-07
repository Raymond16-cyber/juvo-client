"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useThemeStore } from "@/stores/theme.store";
import { useEffect } from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrate = useThemeStore((state) => state.hydrate);
  const preference = useThemeStore((state) => state.preference);
  const refreshSystemTheme = useThemeStore((state) => state.refreshSystemTheme);
  const userTheme = useAuthStore((state) => state.user?.preferences?.theme);

  useEffect(() => {
    hydrate(userTheme);
  }, [hydrate, userTheme]);

  useEffect(() => {
    if (preference !== "system" || typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => refreshSystemTheme();

    refreshSystemTheme();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, [preference, refreshSystemTheme]);

  return children;
}
