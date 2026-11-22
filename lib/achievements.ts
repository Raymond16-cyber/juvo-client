import { celebrateAchievementsService } from "@/services/achievement.service";
import { useCelebrationStore } from "@/stores/celebration.store";
import { useNoticeStore } from "@/stores/notice.store";
import { NewlyEarnedAchievement } from "@/types/achievement.types";

const seenUnlockIds = new Set<string>();

function normalizeNewlyEarned(
  items: NewlyEarnedAchievement[] | undefined | null,
): NewlyEarnedAchievement[] {
  if (!Array.isArray(items) || !items.length) return [];

  const byId = new Map<string, NewlyEarnedAchievement>();
  for (const item of items) {
    if (!item || typeof item.id !== "string" || !item.id.trim()) continue;
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  return [...byId.values()];
}

/**
 * Mark achievements celebrated on the server without playing celebration UI.
 * Used when catching up uncelebrated unlocks on the Achievements page.
 */
export function markAchievementsCelebrated(
  newlyEarned: NewlyEarnedAchievement[] | undefined | null,
) {
  const unique = normalizeNewlyEarned(newlyEarned).filter((item) => {
    if (seenUnlockIds.has(item.id)) return false;
    seenUnlockIds.add(item.id);
    return true;
  });
  if (!unique.length) return;
  void celebrateAchievementsService(unique.map((item) => item.id)).catch(
    () => undefined,
  );
}

/**
 * Celebrate newly earned achievements after the backend confirms the unlock.
 * Deduplicates by id within the session, plays the celebration engine,
 * shows a short notice, and marks items celebrated so refresh won't replay.
 */
export function showAchievementUnlocks(
  newlyEarned: NewlyEarnedAchievement[] | undefined | null,
) {
  const unique = normalizeNewlyEarned(newlyEarned).filter((item) => {
    if (seenUnlockIds.has(item.id)) return false;
    seenUnlockIds.add(item.id);
    return true;
  });

  if (!unique.length) return;

  useCelebrationStore.getState().enqueue(unique);

  // Modal/celebration is the primary reveal. Only toast when several are queued.
  if (unique.length > 1) {
    useNoticeStore.getState().showNotice({
      id: `achievement-unlock-batch-${unique.map((item) => item.id).join("-")}`,
      tone: "success",
      title: "Achievements unlocked",
      body: `${unique.length} milestones earned. Celebrations are queued.`,
      href: "/home/general/achievements",
      linkLabel: "View achievements",
      duration: 6000,
    });
  }

  void celebrateAchievementsService(unique.map((item) => item.id)).catch(
    () => undefined,
  );
}
