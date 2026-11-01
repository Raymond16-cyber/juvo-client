"use client";

import { cn } from "@/lib/ui";
import { AchievementTier } from "@/types/achievement.types";
import { motion } from "framer-motion";
import {
  Archive,
  Award,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CalendarRange,
  CandlestickChart,
  ClipboardCheck,
  Flame,
  Library,
  MessageSquareQuote,
  NotebookPen,
  ShieldCheck,
  ShieldOff,
  Target,
  Trophy,
  LockKeyhole,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  archive: Archive,
  award: Award,
  "book-open": BookOpen,
  "calendar-check": CalendarCheck,
  "calendar-days": CalendarDays,
  "calendar-range": CalendarRange,
  "candlestick-chart": CandlestickChart,
  "clipboard-check": ClipboardCheck,
  flame: Flame,
  library: Library,
  "message-square-quote": MessageSquareQuote,
  "notebook-pen": NotebookPen,
  "shield-check": ShieldCheck,
  "shield-off": ShieldOff,
  target: Target,
  trophy: Trophy,
};

const TIER_STYLES: Record<
  AchievementTier,
  {
    ring: string;
    face: string;
    shine: string;
    icon: string;
    label: string;
  }
> = {
  bronze: {
    ring: "from-[#8a5a2b] via-[#d4a574] to-[#6b4226]",
    face: "from-[#c4844a] via-[#e8b888] to-[#9a6238]",
    shine: "from-[#f0d0a8]/45 to-transparent",
    icon: "text-[#4a2c14] dark:text-[#f6e2c8]",
    label: "Bronze",
  },
  silver: {
    ring: "from-[#6b7280] via-[#e5e7eb] to-[#4b5563]",
    face: "from-[#c0c7d1] via-[#f3f4f6] to-[#8b93a1]",
    shine: "from-white/60 to-transparent",
    icon: "text-slate-700 dark:text-slate-100",
    label: "Silver",
  },
  gold: {
    ring: "from-[#a16207] via-[#fbbf24] to-[#854d0e]",
    face: "from-[#eab308] via-[#fde68a] to-[#ca8a04]",
    shine: "from-[#fff7d6]/65 to-transparent",
    icon: "text-[#5b3a05] dark:text-[#fff3c4]",
    label: "Gold",
  },
  platinum: {
    ring: "from-[#64748b] via-[#e2e8f0] to-[#0ea5e9]",
    face: "from-[#cbd5e1] via-[#f8fafc] to-[#7dd3fc]",
    shine: "from-white/70 to-transparent",
    icon: "text-slate-800 dark:text-sky-50",
    label: "Platinum",
  },
};

type BadgeSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<
  BadgeSize,
  { outer: string; icon: number }
> = {
  sm: { outer: "h-14 w-14", icon: 18 },
  md: { outer: "h-20 w-20", icon: 26 },
  lg: { outer: "h-28 w-28", icon: 36 },
};

type AchievementBadgeProps = {
  tier: AchievementTier;
  icon?: string;
  earned?: boolean;
  animateUnlock?: boolean;
  size?: BadgeSize;
  className?: string;
  featured?: boolean;
  progress?: number;
  locked?: boolean;
};

export default function AchievementBadge({
  tier,
  icon = "award",
  earned = false,
  animateUnlock = false,
  size = "md",
  className,
  featured = false,
  progress = earned ? 100 : 0,
  locked = false,
}: AchievementBadgeProps) {
  const styles = TIER_STYLES[tier] || TIER_STYLES.bronze;
  const dims = SIZE_MAP[size];
  const Icon = ICON_MAP[icon] || Award;

  const progressValue = Math.max(0, Math.min(100, progress));
  const radius = 43;
  const circumference = 2 * Math.PI * radius;

  return (
    <motion.div
      className={cn("relative inline-grid place-items-center", dims.outer, className)}
      initial={animateUnlock ? { scale: 0.86, opacity: 0.4 } : false}
      animate={
        animateUnlock
          ? { scale: [0.86, 1.06, 1], opacity: 1 }
          : { scale: 1, opacity: earned ? 1 : 0.55 }
      }
      transition={
        animateUnlock
          ? { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          : { duration: 0.2 }
      }
      aria-hidden
    >
      <div className="absolute -bottom-[14%] left-[22%] z-0 flex w-[56%] justify-center gap-1">
        <span className={cn("h-[42%] w-[38%] -skew-y-12 rounded-b-md bg-gradient-to-b", styles.ring)} />
        <span className={cn("h-[42%] w-[38%] skew-y-12 rounded-b-md bg-gradient-to-b", styles.ring)} />
      </div>
      <div
        className={cn(
          "absolute inset-0 z-10 rounded-full bg-gradient-to-br p-[2px] shadow-lg",
          styles.ring,
          earned
            ? "shadow-slate-300/60 dark:shadow-black/50"
            : "grayscale-[0.45] opacity-75",
          featured && earned && "ring-2 ring-primary/50 ring-offset-2 ring-offset-white dark:ring-offset-[#070b14]",
        )}
      >
        <div
          className={cn(
            "relative grid h-full w-full place-items-center overflow-hidden rounded-full bg-gradient-to-br",
            styles.face,
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-[9%] rounded-full border border-white/40 bg-gradient-to-tr",
              styles.shine,
            )}
          />
          <div className="pointer-events-none absolute -left-1/4 -top-1/3 h-[66%] w-[66%] rounded-full bg-white/30 blur-md" />
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full -rotate-90"
            aria-hidden
          >
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.9)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progressValue / 100)}
            />
          </svg>
          {locked ? (
            <LockKeyhole
              size={dims.icon - 2}
              className={cn("relative z-10", styles.icon)}
              strokeWidth={2}
            />
          ) : (
            <Icon
              size={dims.icon}
              className={cn("relative z-10", styles.icon)}
              strokeWidth={2.1}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function achievementTierLabel(tier: AchievementTier) {
  return TIER_STYLES[tier]?.label || "Bronze";
}

export function resolveAchievementIcon(icon?: string): LucideIcon {
  if (!icon) return Award;
  return ICON_MAP[icon] || Award;
}
