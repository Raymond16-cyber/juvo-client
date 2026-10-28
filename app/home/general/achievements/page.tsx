"use client";

import AchievementGallery from "@/components/achievements/AchievementGallery";
import DashboardShell from "@/components/dashboard/DashboardShell";
import PageHeader from "@/components/ui/PageHeader";
import { showAchievementUnlocks } from "@/lib/achievements";
import { getApiErrorMessage } from "@/lib/axios";
import {
  getAchievementsService,
  setFeaturedAchievementsService,
} from "@/services/achievement.service";
import {
  AchievementItem,
  AchievementSummary,
} from "@/types/achievement.types";
import { useCallback, useEffect, useState } from "react";

const EMPTY_SUMMARY: AchievementSummary = {
  earned: 0,
  total: 0,
  featured: [],
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [summary, setSummary] = useState<AchievementSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuringId, setFeaturingId] = useState<string | null>(null);

  const loadAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAchievementsService();
      const payload = response.data;
      setAchievements(payload.achievements || []);
      setSummary(payload.summary || EMPTY_SUMMARY);

      const uncelebrated = (payload.achievements || []).filter(
        (item) => item.state === "earned" && !item.celebratedAt,
      );
      if (uncelebrated.length) {
        showAchievementUnlocks(
          uncelebrated.map((item) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            tier: item.tier,
            category: item.category,
            icon: item.icon,
            earnedAt: item.earnedAt,
          })),
        );
        setAchievements((current) =>
          current.map((item) =>
            item.state === "earned" && !item.celebratedAt
              ? { ...item, celebratedAt: new Date().toISOString() }
              : item,
          ),
        );
      } else if (payload.newlyEarned?.length) {
        showAchievementUnlocks(payload.newlyEarned);
      }
    } catch (loadError) {
      setError(
        getApiErrorMessage(loadError, "Unable to load achievements right now."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAchievements();
  }, [loadAchievements]);

  const handleToggleFeatured = async (
    achievementId: string,
    nextFeatured: boolean,
  ) => {
    const earnedIds = achievements
      .filter((item) => item.state === "earned")
      .map((item) => item.id);
    if (!earnedIds.includes(achievementId)) return;

    const currentFeatured = achievements
      .filter((item) => item.featured)
      .map((item) => item.id);

    let next = currentFeatured.filter((id) => id !== achievementId);
    if (nextFeatured) {
      if (next.length >= 3) return;
      next = [...next, achievementId];
    }

    setFeaturingId(achievementId);
    setAchievements((current) =>
      current.map((item) => ({
        ...item,
        featured: next.includes(item.id),
      })),
    );
    setSummary((current) => ({ ...current, featured: next }));

    try {
      await setFeaturedAchievementsService(next);
    } catch (saveError) {
      setError(
        getApiErrorMessage(saveError, "Unable to update featured achievements."),
      );
      await loadAchievements();
    } finally {
      setFeaturingId(null);
    }
  };

  return (
    <DashboardShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          eyebrow="General"
          title="Achievements"
          description="Quiet milestones for process, consistency, and discipline — not vanity P&L."
        />

        {error ? (
          <div className="rounded-2xl border border-rose-300/50 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}

        <AchievementGallery
          achievements={achievements}
          summary={summary}
          loading={loading}
          featuringId={featuringId}
          onToggleFeatured={handleToggleFeatured}
        />
      </div>
    </DashboardShell>
  );
}
