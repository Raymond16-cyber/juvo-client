/**
 * JUVO responsive breakpoint standard (Tailwind defaults, mobile-first).
 *
 * | Token | Min width | Typical use |
 * |-------|-----------|-------------|
 * | base  | 0         | phones (320–639) |
 * | sm    | 640px     | large phones / small tablets |
 * | md    | 768px     | tablets |
 * | lg    | 1024px    | compact desktop / sidebar expands |
 * | xl    | 1280px    | desktop multi-column |
 * | 2xl   | 1536px    | wide desktop |
 *
 * Prefer flexible layout (flex/grid/minmax/min-w-0) before adding breakpoints.
 * Use content-driven overrides only when a component genuinely needs them.
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

/** Shared layout class strings — reuse instead of inventing new paddings. */
export const pageShellClassName =
  "mx-auto w-full max-w-[1500px] px-3 py-4 sm:px-4 sm:py-5 lg:px-8 lg:py-8";

export const pageShellFillClassName =
  "mx-auto flex min-h-0 w-full max-w-[1500px] flex-1 flex-col overflow-hidden px-2.5 py-2.5 sm:px-4 sm:py-3 lg:px-6 lg:py-4";

export const sectionStackClassName = "space-y-4 sm:space-y-5 lg:space-y-6";

export const cardPadClassName = "p-4 sm:p-5";

export const metricGridClassName =
  "grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 xl:grid-cols-4";

export const filterControlClassName =
  "block w-full min-w-0 sm:min-w-[190px] sm:max-w-xs";

export const touchTargetClassName =
  "inline-flex min-h-11 min-w-11 items-center justify-center";

export const modalPanelClassName =
  "pointer-events-auto max-h-[min(92dvh,920px)] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-card dark:text-white dark:shadow-black/50 sm:p-6";
