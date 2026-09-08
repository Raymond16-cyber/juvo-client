"use client";

import { getRealtimeUrl } from "@/services/realtime.service";
import { useAccountsStore } from "@/stores/accounts.store";
import { useBrokerStore } from "@/stores/broker.store";
import { useJournalStore } from "@/stores/journal.store";
import { useNoticeStore } from "@/stores/notice.store";
import { formatMoney } from "@/lib/format";
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname?.startsWith("/home")) return;

    const token = window.localStorage.getItem("token");
    if (!token) return;

    const socket = new WebSocket(getRealtimeUrl(token));
    const pendingPositionUpdates = new Map<string, BrokerPositionLiveUpdate>();
    let positionUpdateFrame: number | null = null;

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

    socket.onmessage = (message) => {
      let envelope: RealtimeEnvelope;
      try {
        envelope = JSON.parse(message.data);
      } catch {
        return;
      }

      if (envelope.event === "position:updated") {
        useBrokerStore.getState().fetchPositions("open").catch(() => undefined);
        return;
      }

      if (envelope.event === "position:update" && envelope.payload?.positionId) {
        queuePositionUpdate(envelope.payload);
        return;
      }

      if (envelope.event === "trade:closed") {
        const trade = envelope.payload?.trade;
        useNoticeStore.getState().showNotice({
          title: "Trade closed",
          body: `${trade?.symbol || "cTrader"} ${trade?.direction || ""} ${formatMoney(
            Number(trade?.profitLoss || 0),
            trade?.profitLossCurrency || "USD",
          )}`.trim(),
          tone: "success",
        });

        useJournalStore.getState().getUserJournals().catch(() => undefined);
        useJournalStore.getState().getTodayJournalStatus().catch(() => undefined);
        useAccountsStore.getState().fetchAccounts().catch(() => undefined);
        useBrokerStore.getState().fetchPositions("open").catch(() => undefined);
      }
    };

    return () => {
      if (positionUpdateFrame != null) {
        window.cancelAnimationFrame(positionUpdateFrame);
      }
      pendingPositionUpdates.clear();
      socket.close();
    };
  }, [pathname]);

  return null;
}
