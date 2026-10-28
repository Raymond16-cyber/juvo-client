export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export type AchievementCategory =
  | "journey"
  | "journaling"
  | "consistency"
  | "trading_records"
  | "discipline";

export type AchievementState = "earned" | "available" | "locked";

export interface AchievementItem {
  id: string;
  category: AchievementCategory;
  tier: AchievementTier;
  title: string;
  description: string;
  criteriaLabel: string;
  icon: string;
  threshold: number;
  current: number;
  progressRatio: number;
  minSample?: number | null;
  sample?: number | null;
  state: AchievementState;
  earnedAt: string | null;
  celebratedAt: string | null;
  featured: boolean;
}

export interface NewlyEarnedAchievement {
  id: string;
  title?: string;
  description?: string;
  tier?: AchievementTier;
  category?: AchievementCategory;
  icon?: string;
  earnedAt?: string | null;
}

export interface AchievementSummary {
  earned: number;
  total: number;
  featured: string[];
}

export interface AchievementMetrics {
  [key: string]: number | null | undefined;
}

export interface AchievementsPayload {
  summary: AchievementSummary;
  newlyEarned: NewlyEarnedAchievement[];
  achievements: AchievementItem[];
  metrics: AchievementMetrics;
}

export interface AchievementsResponse {
  message: string;
  data: AchievementsPayload;
}

export interface CelebrateAchievementsResponse {
  message: string;
  data: { matched: number; modified: number };
}

export interface FeaturedAchievementsResponse {
  message: string;
  data: {
    featuredAchievements?: string[];
    featured?: string[];
  };
}
