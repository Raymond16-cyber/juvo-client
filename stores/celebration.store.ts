import { create } from "zustand";
import type { NewlyEarnedAchievement } from "@/types/achievement.types";
import { sortByCelebrationPriority } from "@/lib/celebrations/achievementTriggers";
import {
  intensityFromTier,
  type CelebrationIntensity,
} from "@/lib/celebrations/intensity";

export type CelebrationPayload = {
  achievement: NewlyEarnedAchievement;
  intensity: CelebrationIntensity;
};

const intensityRank: Record<CelebrationIntensity, number> = {
  small: 1,
  medium: 2,
  grand: 3,
};

type CelebrationStore = {
  queue: CelebrationPayload[];
  active: CelebrationPayload | null;
  enqueue: (items: NewlyEarnedAchievement[]) => void;
  /** Force a celebration for QA/preview without backend unlock. */
  preview: (
    achievement?: Partial<NewlyEarnedAchievement> & { intensity?: CelebrationIntensity },
  ) => void;
  beginNext: () => void;
  completeActive: () => void;
  dismissActive: () => void;
  clear: () => void;
};

export const useCelebrationStore = create<CelebrationStore>((set, get) => ({
  queue: [],
  active: null,

  enqueue: (items) => {
    if (!items.length) return;
    const ordered = sortByCelebrationPriority(items);
    const payloads: CelebrationPayload[] = ordered.map((achievement) => ({
      achievement,
      intensity: intensityFromTier(achievement.tier),
    }));

    set((state) => {
      const existingIds = new Set([
        ...state.queue.map((item) => item.achievement.id),
        ...(state.active ? [state.active.achievement.id] : []),
      ]);
      const next = payloads.filter(
        (item) => !existingIds.has(item.achievement.id),
      );
      if (!next.length) return state;
      const queue = [...state.queue, ...next].sort(
        (a, b) => intensityRank[b.intensity] - intensityRank[a.intensity],
      );
      return { queue };
    });

    if (!get().active) {
      get().beginNext();
    }
  },

  preview: (achievement) => {
    const intensity = achievement?.intensity || "grand";
    const payload: CelebrationPayload = {
      intensity,
      achievement: {
        id: achievement?.id || `preview-${intensity}-${Date.now()}`,
        title: achievement?.title || "Preview celebration",
        description:
          achievement?.description ||
          "This is a preview of JUVO’s achievement celebration.",
        tier:
          achievement?.tier ||
          (intensity === "grand"
            ? "gold"
            : intensity === "medium"
              ? "silver"
              : "bronze"),
        category: achievement?.category || "journaling",
        icon: achievement?.icon || "trophy",
        earnedAt: new Date().toISOString(),
      },
    };

    const { active, queue } = get();
    if (active) {
      set({ queue: [...queue, payload] });
      return;
    }
    set({ active: payload });
  },

  beginNext: () => {
    const { queue, active } = get();
    if (active || !queue.length) return;
    const [next, ...rest] = queue;
    set({ active: next, queue: rest });
  },

  completeActive: () => {
    set({ active: null });
    queueMicrotask(() => get().beginNext());
  },

  dismissActive: () => {
    set({ active: null });
    queueMicrotask(() => get().beginNext());
  },

  clear: () => set({ queue: [], active: null }),
}));
