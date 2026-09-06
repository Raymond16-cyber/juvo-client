"use client";

import { getRealtimeUrl } from "@/services/realtime.service";
import { useAccountsStore } from "@/stores/accounts.store";
import { useBrokerStore } from "@/stores/broker.store";
import { useJournalStore } from "@/stores/journal.store";
import { useNoticeStore } from "@/stores/notice.store";
import { formatMoney } from "@/lib/format";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

type RealtimeEnvelope = {
  event?: string;
  payload?: {
    trade?: {
      _id: string;
      symbol?: string;
      direction?: string;
      profitLoss?: number;
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

      if (envelope.event === "trade:closed") {
        const trade = envelope.payload?.trade;
        useNoticeStore.getState().showNotice({
          title: "Trade closed",
          body: `${trade?.symbol || "cTrader"} ${trade?.direction || ""} ${formatMoney(Number(trade?.profitLoss || 0))}`.trim(),
          tone: "success",
        });

        useJournalStore.getState().getUserJournals().catch(() => undefined);
        useJournalStore.getState().getTodayJournalStatus().catch(() => undefined);
        useAccountsStore.getState().fetchAccounts().catch(() => undefined);
        useBrokerStore.getState().fetchPositions("open").catch(() => undefined);
      }
    };

    return () => {
      socket.close();
    };
  }, [pathname]);

  return null;
}
