import type { BrokerConnectionStatus } from "../types/broker.types";

export type MetaTraderStatusReason =
  | "heartbeat_timeout"
  | "terminal_disconnected"
  | "synchronizing"
  | "catching_up";

export const brokerStatusCopy: Record<BrokerConnectionStatus, string> = {
  connecting: "Connecting",
  connected: "Connected",
  disconnected: "Disconnected",
  error: "Needs attention",
  reauthorization_required: "Reconnect required",
  synchronizing: "Synchronizing",
  stale: "Heartbeat delayed",
  offline: "Terminal offline",
};

export const metaTraderReasonCopy: Record<MetaTraderStatusReason, string> = {
  heartbeat_timeout:
    "No recent heartbeat from JUVO Connector. Keep MT5 running with the EA attached.",
  terminal_disconnected:
    "MT5 reported the terminal as disconnected. Reopen the terminal and keep JUVO Connector on a chart.",
  synchronizing: "Connector is connected and importing account state.",
  catching_up:
    "Terminal reconnected. Juvo is catching up history from while the desktop was offline.",
};

export const metaTraderDesktopGuidance = {
  desktopOnline:
    "Keep the MT5 desktop terminal online with JUVO Connector attached. Mobile and same-account trades only appear in Juvo while that desktop session stays running.",
  offlineCatchUp:
    "If the terminal or EA goes offline, live updates pause. When the connector reconnects, Juvo catches up available history.",
};

export function brokerStatusStyle(status: BrokerConnectionStatus) {
  if (status === "connected")
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (["error", "reauthorization_required"].includes(status))
    return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  if (status === "disconnected")
    return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300";
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
}

export function metaTraderStatusGuidance(
  status: BrokerConnectionStatus,
  reason?: MetaTraderStatusReason | null,
) {
  if (reason && metaTraderReasonCopy[reason]) return metaTraderReasonCopy[reason];
  if (status === "stale") return metaTraderReasonCopy.heartbeat_timeout;
  if (status === "offline") return metaTraderReasonCopy.terminal_disconnected;
  if (status === "synchronizing") return metaTraderReasonCopy.synchronizing;
  return null;
}
