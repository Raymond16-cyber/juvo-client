import type { AchievementTier } from "@/types/achievement.types";

export type CelebrationIntensity = "small" | "medium" | "grand";

/** Map existing achievement tiers to celebration intensity. No XP or points. */
export function intensityFromTier(
  tier?: AchievementTier | null,
): CelebrationIntensity {
  if (tier === "platinum" || tier === "gold") return "grand";
  if (tier === "silver") return "medium";
  return "small";
}

export function pickStrongestIntensity(
  intensities: CelebrationIntensity[],
): CelebrationIntensity {
  const rank: Record<CelebrationIntensity, number> = {
    small: 1,
    medium: 2,
    grand: 3,
  };
  return intensities.reduce<CelebrationIntensity>((best, next) => {
    return rank[next] > rank[best] ? next : best;
  }, "small");
}

export const CELEBRATION_COLORS = {
  small: ["#00D4FF", "#38bdf8", "#e2e8f0", "#fbbf24"],
  medium: ["#00D4FF", "#22d3ee", "#fbbf24", "#34d399", "#f87171", "#ffffff"],
  grand: [
    "#00D4FF",
    "#22d3ee",
    "#fbbf24",
    "#f59e0b",
    "#34d399",
    "#f87171",
    "#a78bfa",
    "#ffffff",
    "#0B1220",
  ],
} as const;
