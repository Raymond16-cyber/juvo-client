export const cardClassName =
  "rounded-card border border-border bg-card text-text shadow-juvo";

export const panelClassName =
  "rounded-card border border-border bg-surface text-text";

export const controlClassName =
  "h-10 w-full min-w-0 rounded-control border border-border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-strong focus:ring-2 focus:ring-juvo dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500";

export const textareaClassName =
  "min-h-24 w-full min-w-0 resize-y rounded-control border border-border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary-strong focus:ring-2 focus:ring-juvo dark:bg-white/[0.03] dark:text-white dark:placeholder:text-slate-500";

export const pillClassName =
  "inline-flex items-center rounded-md border border-border bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-white/[0.04] dark:text-slate-300";

export const navItemClassName =
  "flex items-center gap-3 rounded-control px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.05] dark:hover:text-white";

export const navItemActiveClassName =
  "bg-slate-950 text-white hover:bg-slate-900 hover:text-white dark:bg-primary/12 dark:text-primary dark:hover:bg-primary/15 dark:hover:text-primary";

export const tableClassName =
  "w-full min-w-0 border-collapse text-left text-sm";

export const tableHeadClassName =
  "border-b border-border bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:bg-white/[0.03] dark:text-slate-400";

export const metricValueClassName =
  "text-2xl font-semibold tabular-nums tracking-tight text-slate-950 dark:text-white";

export {
  BREAKPOINTS,
  cardPadClassName,
  filterControlClassName,
  metricGridClassName,
  modalPanelClassName,
  pageShellClassName,
  pageShellFillClassName,
  sectionStackClassName,
  touchTargetClassName,
} from "./responsive";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
