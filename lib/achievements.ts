import { celebrateAchievementsService } from "@/services/achievement.service";
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
 * Show success notices for newly earned achievements and mark them celebrated.
 * Deduplicates by id within the current session and ignores empty payloads.
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

  for (const item of unique) {
    const title = item.title?.trim() || "New achievement";
    useNoticeStore.getState().showNotice({
      id: `achievement-unlock-${item.id}`,
      tone: "success",
      title: "Achievement unlocked",
      body: `${title}. Open Achievements to review your progress.`,
      href: "/home/general/achievements",
      linkLabel: "View achievements",
      duration: 8000,
    });
  }

  void celebrateAchievementsService(unique.map((item) => item.id)).catch(
    () => undefined,
  );
}
