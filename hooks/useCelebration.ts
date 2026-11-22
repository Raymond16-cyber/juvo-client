"use client";

import { useCelebrationStore } from "@/stores/celebration.store";
import type { NewlyEarnedAchievement } from "@/types/achievement.types";

/** Queue achievement celebrations from UI or unlock helpers. */
export function useCelebration() {
  const enqueue = useCelebrationStore((state) => state.enqueue);
  const active = useCelebrationStore((state) => state.active);
  const dismissActive = useCelebrationStore((state) => state.dismissActive);

  return {
    active,
    celebrateAchievements: (items: NewlyEarnedAchievement[]) => enqueue(items),
    dismiss: dismissActive,
  };
}
