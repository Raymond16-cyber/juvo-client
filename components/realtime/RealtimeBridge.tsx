"use client";

import { getRealtimeUrl } from "@/services/realtime.service";
import { useAccountsStore } from "@/stores/accounts.store";
import { useBrokerStore } from "@/stores/broker.store";
import { useJournalStore } from "@/stores/journal.store";
import { useNoticeStore } from "@/stores/notice.store";
import { formatMoney } from "@/lib/format";
import { connectRealtime } from "@/lib/realtime-connection";
import { useAuthStore } from "@/stores/auth.store";
import { useAnalyticsStore } from "@/stores/analytics.store";
import { BrokerPositionLiveUpdate } from "@/types/broker.types";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type RealtimeEnvelope = {
  event?: string;
  payload?: BrokerPositionLiveUpdate & {
    trade?: {
      _id: string;
      symbol?: string;
      direction?: string;
      profitLoss?: number;
      profitLossCurrency?: string;
      journal?: string;
    };
  };
};

export default function RealtimeBridge() {
  const pathname = usePathname();
  const inDashboard = pathname?.startsWith("/home");
  const token = useAuthStore((state) => state.token);
  const authenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!inDashboard || !authenticated || !token) return;
    const pendingPositionUpdates = new Map<string, BrokerPositionLiveUpdate>();
    let positionUpdateFrame: number | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    let refreshing = false;
    let refreshPending = false;
    let disposed = false;
    const notifiedTrades = new Set<string>();

    const refreshData = () => {
      if (disposed) return;
      if (refreshing) {
        refreshPending = true;
        return;
      }
      if (refreshTimer) return;
      refreshTimer = setTimeout(async () => {
        refreshTimer = null;
        refreshing = true;
        await Promise.allSettled([
          useJournalStore.getState().getUserJournals(),
          useJournalStore.getState().getTodayJournalStatus(),
          useAccountsStore.getState().fetchAccounts(),
          useBrokerStore.getState().fetchPositions("open"),
          useBrokerStore.getState().fetchConnections(),
          useAnalyticsStore.getState().refreshAnalytics(),
        ]);
        refreshing = false;
        if (refreshPending) {
          refreshPending = false;
          refreshData();
        }
      }, 250);
    };

    const flushPositionUpdates = () => {
      positionUpdateFrame = null;
      const updates = Array.from(pendingPositionUpdates.values());
      pendingPositionUpdates.clear();

      const brokerStore = useBrokerStore.getState();
      updates.forEach((update) => brokerStore.applyPositionLiveUpdate(update));
    };

    const queuePositionUpdate = (update: BrokerPositionLiveUpdate) => {
      pendingPositionUpdates.set(update.positionId, update);
      if (positionUpdateFrame == null) {
        positionUpdateFrame = window.requestAnimationFrame(flushPositionUpdates);
      }
    };

    const onMessage = (message: MessageEvent) => {
      let envelope: RealtimeEnvelope;
      try {
        envelope = JSON.parse(message.data);
      } catch {
        return;
      }
      if (!envelope || typeof envelope !== "object") return;

      if (envelope.event === "position:updated") {
        refreshData();
        return;
      }

      if (envelope.event === "position:update" && envelope.payload?.positionId) {
        queuePositionUpdate(envelope.payload);
        return;
      }

      if (envelope.event === "trade:closed") {
        const trade = envelope.payload?.trade;
        if (trade?._id && notifiedTrades.has(trade._id)) return;
        if (trade?._id) {
          notifiedTrades.add(trade._id);
          if (notifiedTrades.size > 200) notifiedTrades.delete(notifiedTrades.values().next().value!);
        }
        useNoticeStore.getState().showNotice({
          title: "Trade closed",
          body: `${trade?.symbol || "cTrader"} ${trade?.direction || ""} ${formatMoney(
            Number(trade?.profitLoss || 0),
            trade?.profitLossCurrency || "USD",
          )}`.trim(),
          tone: "success",
        });

        refreshData();
      }
    };
    const disconnect = connectRealtime({ url: getRealtimeUrl(token), onMessage, onOpen: refreshData });

    return () => {
      disposed = true;
      if (refreshTimer) clearTimeout(refreshTimer);
      if (positionUpdateFrame != null) {
        window.cancelAnimationFrame(positionUpdateFrame);
      }
      pendingPositionUpdates.clear();
      disconnect();
    };
  }, [authenticated, inDashboard, token]);

  return null;
}
