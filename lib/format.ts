export function formatDate(value?: string | Date, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(new Date(value));
}

export function normalizeCurrency(currency?: string | null) {
  const code = String(currency || "USD").trim().toUpperCase();
  return /^[A-Z]{3}$/.test(code) ? code : "USD";
}

export function formatMoney(value: number, currency = "USD") {
  const code = normalizeCurrency(currency);
  const absolute = Math.abs(value);

  let formatted: string;
  try {
    formatted = new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      maximumFractionDigits: absolute >= 1000 ? 0 : 2,
    }).format(absolute);
  } catch {
    formatted = `${code} ${absolute.toFixed(absolute >= 1000 ? 0 : 2)}`;
  }

  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

export function formatCompactMoney(value: number, currency = "USD") {
  const code = normalizeCurrency(currency);
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: code,
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return `${code} ${value}`;
  }
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
