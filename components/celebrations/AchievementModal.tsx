"use client";

import AchievementBadge, {
  achievementTierLabel,
} from "@/components/achievements/AchievementBadge";
import Button from "@/components/ui/Button";
import { interactionTransition } from "@/lib/motion";
import type { NewlyEarnedAchievement } from "@/types/achievement.types";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  journey: "JUVO Journey",
  journaling: "Journaling",
  consistency: "Consistency",
  trading_records: "Trading records",
  discipline: "Discipline",
};

type AchievementModalProps = {
  achievement: NewlyEarnedAchievement;
  open: boolean;
  onClose: () => void;
};

export default function AchievementModal({
  achievement,
  open,
  onClose,
}: AchievementModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const tier = achievement.tier || "bronze";
  const category = achievement.category
    ? CATEGORY_LABELS[achievement.category] || achievement.category
    : null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[92] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={interactionTransition(0.18)}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievement-unlock-title"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={interactionTransition(0.22)}
            className="relative w-full max-w-md overflow-hidden rounded-card border border-border bg-card p-6 shadow-juvo"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/15 via-amber-400/10 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-control text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Dismiss achievement"
            >
              <X size={16} />
            </button>

            <div className="relative flex flex-col items-center text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-600 dark:text-amber-300">
                Achievement unlocked
              </p>
              <div className="mt-4">
                <AchievementBadge
                  tier={tier}
                  achievementId={achievement.id}
                  icon={achievement.icon}
                  earned
                  animateUnlock
                  size="lg"
                />
              </div>
              <h2
                id="achievement-unlock-title"
                className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white"
              >
                {achievement.title?.trim() || "New achievement"}
              </h2>
              {achievement.description ? (
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {achievement.description}
                </p>
              ) : (
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  A meaningful process milestone on your JUVO journey.
                </p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  {achievementTierLabel(tier)}
                </span>
                {category ? (
                  <span className="rounded-full border border-border bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                    {category}
                  </span>
                ) : null}
              </div>
              <Button type="button" className="mt-6 min-w-[10rem]" onClick={onClose}>
                Continue
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
