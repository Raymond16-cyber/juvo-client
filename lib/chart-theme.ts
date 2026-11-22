/** Shared Recharts styling for calm financial charts. */

import type { CSSProperties } from "react";

export const chartTheme = {
  grid: "rgba(148, 163, 184, 0.25)",
  axis: "#94A3B8",
  tick: "#64748B",
  tooltipBg: "var(--card)",
  tooltipBorder: "var(--border)",
  cursor: "rgba(100, 116, 139, 0.12)",
  brand: "#00D4FF",
  profit: "#159A5A",
  loss: "#D64545",
  muted: "#94A3B8",
} as const;

export const chartTooltipStyle: CSSProperties = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  boxShadow: "var(--shadow)",
  fontSize: 12,
  color: "var(--text)",
};
