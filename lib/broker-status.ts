import type { BrokerConnectionStatus } from "../types/broker.types";

export const brokerStatusCopy: Record<BrokerConnectionStatus, string> = {
  connecting: "Connecting", connected: "Connected", disconnected: "Disconnected",
  error: "Needs attention", reauthorization_required: "Reconnect required",
  awaiting_configuration: "Waiting for setup", deploying: "Connecting",
  synchronizing: "Synchronizing", reconnecting: "Reconnecting",
  broker_auth_failed: "Review secure setup", disconnecting: "Disconnecting",
};

export function brokerStatusStyle(status: BrokerConnectionStatus) {
  if (status === "connected") return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (["error", "broker_auth_failed", "reauthorization_required"].includes(status)) return "bg-rose-500/10 text-rose-700 dark:text-rose-300";
  if (status === "disconnected") return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300";
  return "bg-amber-500/10 text-amber-700 dark:text-amber-300";
}
