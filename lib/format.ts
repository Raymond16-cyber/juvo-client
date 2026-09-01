export function formatDate(value?: string | Date, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function formatMoney(value: number, currency = "USD") {
  const absolute = Math.abs(value);
  const formatted = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
    maximumFractionDigits: absolute >= 1000 ? 0 : 2,
  }).format(absolute);

  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value);
}

export function pnlClass(value: number) {
  if (value > 0) return "text-emerald-600 dark:text-emerald-300";
  if (value < 0) return "text-rose-600 dark:text-rose-300";
  return "text-slate-950 dark:text-white";
}

export function titleCase(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
