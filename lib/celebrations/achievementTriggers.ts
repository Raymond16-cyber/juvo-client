import { intensityFromTier } from "@/lib/celebrations/intensity";
import type { NewlyEarnedAchievement } from "@/types/achievement.types";

/**
 * Helpers for mapping backend unlock payloads to celebration intents.
 * Unlock detection itself stays in journal/no-trade flows via `newlyEarned`.
 */

export function describeCelebration(item: NewlyEarnedAchievement) {
  return {
    id: item.id,
    title: item.title || "Achievement unlocked",
    intensity: intensityFromTier(item.tier),
    tier: item.tier || "bronze",
  };
}

export function sortByCelebrationPriority(
  items: NewlyEarnedAchievement[],
): NewlyEarnedAchievement[] {
  const rank = { platinum: 4, gold: 3, silver: 2, bronze: 1 } as const;
  return [...items].sort((a, b) => {
    const aRank = rank[a.tier || "bronze"] || 1;
    const bRank = rank[b.tier || "bronze"] || 1;
    return bRank - aRank;
  });
}
