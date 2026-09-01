export const cardClassName =
  "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-card";

export const controlClassName =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white";

export const textareaClassName =
  "min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary dark:border-white/10 dark:bg-white/[0.04] dark:text-white";

export const pillClassName =
  "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/10 dark:text-slate-300";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
