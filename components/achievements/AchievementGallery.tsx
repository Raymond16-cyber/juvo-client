"use client";

import AchievementBadge, {
  achievementTierLabel,
} from "@/components/achievements/AchievementBadge";
import AnimatedProgress from "@/components/ui/AnimatedProgress";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { cn, pillClassName } from "@/lib/ui";
import {
  AchievementCategory,
  AchievementItem,
  AchievementSummary,
} from "@/types/achievement.types";
import { AnimatePresence, motion } from "framer-motion";
import { Star, Trophy, X } from "lucide-react";
import { useMemo, useState } from "react";
import { createPortal } from "react-dom";

type ProgressFilter = "all" | "earned" | "in_progress";

const CATEGORY_LABELS: Record<AchievementCategory | "all", string> = {
  all: "All categories",
  journey: "Journey",
  journaling: "Journaling",
  consistency: "Consistency",
  trading_records: "Trading records",
  discipline: "Discipline",
};

const PROGRESS_FILTERS: Array<{ id: ProgressFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "earned", label: "Earned" },
  { id: "in_progress", label: "In progress" },
];

type AchievementGalleryProps = {
  achievements: AchievementItem[];
  summary: AchievementSummary;
  loading?: boolean;
  onToggleFeatured: (achievementId: string, nextFeatured: boolean) => Promise<void> | void;
  featuringId?: string | null;
};

function progressPercent(item: AchievementItem) {
  if (item.state === "earned") return 100;
  const ratio =
    typeof item.progressRatio === "number"
      ? item.progressRatio
      : item.threshold
        ? item.current / item.threshold
        : 0;
  return Math.max(0, Math.min(100, Math.round(ratio * 100)));
}

function formatEarnedAt(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AchievementGallery({
  achievements,
  summary,
  loading = false,
  onToggleFeatured,
  featuringId = null,
}: AchievementGalleryProps) {
  const [progressFilter, setProgressFilter] = useState<ProgressFilter>("all");
  const [category, setCategory] = useState<AchievementCategory | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(
    () => achievements.find((item) => item.id === selectedId) || null,
    [achievements, selectedId],
  );

  const filtered = useMemo(() => {
    return achievements.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (progressFilter === "earned") return item.state === "earned";
      if (progressFilter === "in_progress") {
        return item.state !== "earned" && progressPercent(item) > 0;
      }
      return true;
    });
  }, [achievements, category, progressFilter]);

  const featuredCount = achievements.filter((item) => item.featured).length;

  return (
    <div className="space-y-6">
      <Card className="p-5 sm:p-6" interactive={false}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Trophy size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Progress
              </p>
              <p className="mt-0.5 text-2xl font-bold text-slate-950 dark:text-white">
                {summary.earned}
                <span className="text-base font-semibold text-slate-400 dark:text-slate-500">
                  {" "}
                  / {summary.total}
                </span>
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Feature up to three earned badges on your profile · {featuredCount}/3
              </p>
            </div>
          </div>
          <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-100 dark:bg-white/10 sm:w-56">
            <AnimatedProgress
              value={
                summary.total
                  ? Math.round((summary.earned / summary.total) * 100)
                  : 0
              }
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {PROGRESS_FILTERS.map((filter) => {
            const active = progressFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setProgressFilter(filter.id)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
                  active
                    ? "border-slate-950 bg-slate-950 text-white dark:border-primary dark:bg-primary/15 dark:text-primary"
                    : "border-slate-200 bg-white text-slate-500 hover:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
        <select
          className="h-10 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200"
          value={category}
          onChange={(event) =>
            setCategory(event.target.value as AchievementCategory | "all")
          }
          aria-label="Filter by category"
        >
          {(Object.keys(CATEGORY_LABELS) as Array<AchievementCategory | "all">).map(
            (key) => (
              <option key={key} value={key}>
                {CATEGORY_LABELS[key]}
              </option>
            ),
          )}
        </select>
      </div>

      {loading ? (
        <Card className="p-8 text-center text-sm text-slate-500 dark:text-slate-400" interactive={false}>
          Loading achievements…
        </Card>
      ) : filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const earned = item.state === "earned";
            const percent = progressPercent(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id)}
                className="text-left"
              >
                <Card className="h-full p-5">
                  <div className="flex items-start gap-4">
                    <AchievementBadge
                      tier={item.tier}
                      icon={item.icon}
                      earned={earned}
                      featured={item.featured}
                      animateUnlock={earned && !item.celebratedAt}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={pillClassName}>
                          {achievementTierLabel(item.tier)}
                        </span>
                        <span className={pillClassName}>
                          {CATEGORY_LABELS[item.category]}
                        </span>
                        {item.featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-primary">
                            <Star size={12} />
                            Featured
                          </span>
                        ) : null}
                      </div>
                      <h3 className="mt-2 truncate text-base font-bold text-slate-950 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  {!earned ? (
                    <div className="mt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>{item.criteriaLabel}</span>
                        <span>
                          {item.current}/{item.threshold}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <AnimatedProgress value={percent} />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Earned
                      {formatEarnedAt(item.earnedAt)
                        ? ` · ${formatEarnedAt(item.earnedAt)}`
                        : ""}
                    </p>
                  )}
                </Card>
              </button>
            );
          })}
        </div>
      ) : (
        <Card interactive={false}>
          <EmptyState
            icon={Trophy}
            title="No achievements in this view"
            body="Try another filter, or keep journaling to unlock the next badge."
          />
        </Card>
      )}

      <AchievementDetailModal
        item={selected}
        featuredCount={featuredCount}
        featuring={Boolean(selected && featuringId === selected.id)}
        onClose={() => setSelectedId(null)}
        onToggleFeatured={onToggleFeatured}
      />
    </div>
  );
}

function AchievementDetailModal({
  item,
  featuredCount,
  featuring,
  onClose,
  onToggleFeatured,
}: {
  item: AchievementItem | null;
  featuredCount: number;
  featuring: boolean;
  onClose: () => void;
  onToggleFeatured: (achievementId: string, nextFeatured: boolean) => Promise<void> | void;
}) {
  if (typeof document === "undefined") return null;

  const earned = item?.state === "earned";
  const canFeature = Boolean(earned);
  const featureDisabled =
    !canFeature ||
    featuring ||
    (!item?.featured && featuredCount >= 3);

  return createPortal(
    <AnimatePresence>
      {item ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
          <motion.button
            type="button"
            aria-label="Close achievement details"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievement-detail-title"
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0B1220]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {achievementTierLabel(item.tier)} · {CATEGORY_LABELS[item.category]}
                </p>
                <h2
                  id="achievement-detail-title"
                  className="mt-1 text-xl font-bold text-slate-950 dark:text-white"
                >
                  {item.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5 px-5 py-5">
              <div className="flex items-center gap-4">
                <AchievementBadge
                  tier={item.tier}
                  icon={item.icon}
                  earned={earned}
                  featured={item.featured}
                  animateUnlock={earned && !item.celebratedAt}
                  size="lg"
                />
                <div>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                  {earned && formatEarnedAt(item.earnedAt) ? (
                    <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Earned {formatEarnedAt(item.earnedAt)}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Criteria
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {item.criteriaLabel}
                </p>
                <div className="mt-3">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>
                      {item.current} / {item.threshold}
                    </span>
                    <span>{progressPercent(item)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                    <AnimatedProgress value={progressPercent(item)} />
                  </div>
                </div>
              </div>

              {canFeature ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {item.featured
                      ? "This badge is featured on your profile."
                      : featuredCount >= 3
                        ? "You already have three featured badges."
                        : "Feature this badge on your profile (max 3)."}
                  </p>
                  <Button
                    variant={item.featured ? "ghost" : "primary"}
                    disabled={featureDisabled && !item.featured}
                    onClick={() => void onToggleFeatured(item.id, !item.featured)}
                  >
                    <Star size={15} />
                    {featuring
                      ? "Saving…"
                      : item.featured
                        ? "Unfeature"
                        : "Feature"}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Keep going — earn this badge to feature it on your profile.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
