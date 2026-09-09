import { getApiErrorMessage } from "@/lib/axios";
import {
  completeCTraderConnectService,
  disconnectCTraderService,
  getBrokerConnectionsService,
  getBrokerPositionsService,
  getCTraderConnectUrlService,
  syncCTraderService,
} from "@/services/broker.service";
import {
  BrokerConnection,
  BrokerPosition,
  BrokerPositionLiveUpdate,
  CTraderSyncResult,
} from "@/types/broker.types";
import { create } from "zustand";

interface BrokerState {
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  message: string | null;
  isConnected: boolean;
  connections: BrokerConnection[];
  positions: BrokerPosition[];
  lastSync: CTraderSyncResult | null;
  startCTraderConnect: () => Promise<void>;
  completeCTraderConnect: (code: string) => Promise<void>;
  fetchConnections: () => Promise<BrokerConnection[]>;
  fetchPositions: (status?: string) => Promise<BrokerPosition[]>;
  syncCTrader: (connectionId?: string) => Promise<CTraderSyncResult>;
  disconnectCTrader: (connectionId: string) => Promise<void>;
  applyPositionLiveUpdate: (update: BrokerPositionLiveUpdate) => void;
  clearBrokerNotice: () => void;
}

function hasConnectedBroker(connections: BrokerConnection[]) {
  return connections.some((connection) => connection.status === "connected");
}

export const useBrokerStore = create<BrokerState>((set, get) => ({
  isLoading: false,
  isConnecting: false,
  error: null,
  message: null,
  isConnected: false,
  connections: [],
  positions: [],
  lastSync: null,
  startCTraderConnect: async () => {
    set({
      isConnecting: true,
      error: null,
      message: null,
    });

    try {
      const result = await getCTraderConnectUrlService();
      if (!result?.authorizationUrl) {
        throw new Error("cTrader did not return an authorization URL.");
      }

      set({
        isConnecting: false,
        message: result.message,
      });

      window.location.href = result.authorizationUrl;
    } catch (error) {
      set({
        isConnecting: false,
        error: getApiErrorMessage(error, "Broker connection failed"),
        message: null,
        isConnected: false,
      });
    }
  },
  completeCTraderConnect: async (code) => {
    set({
      isConnecting: true,
      error: null,
      message: null,
    });

    try {
      const result = await completeCTraderConnectService(code);
      const connections = await get().fetchConnections().catch(() => [
        result.data,
      ]);
      await get().fetchPositions("open").catch(() => []);

      set({
        isConnecting: false,
        error: null,
        message: result.message,
        isConnected: hasConnectedBroker(connections),
        connections,
      });
    } catch (error) {
      set({
        isConnecting: false,
        error: getApiErrorMessage(error, "Broker connection failed"),
        message: null,
      });
      throw error;
    }
  },
  fetchConnections: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await getBrokerConnectionsService();
      const connections = result.data || [];
      set({
        connections,
        isConnected: hasConnectedBroker(connections),
        isLoading: false,
        message: result.message,
      });
      return connections;
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, "Unable to load broker connections."),
      });
      throw error;
    }
  },
  fetchPositions: async (status) => {
    set({ isLoading: true, error: null });

    try {
      const result = await getBrokerPositionsService(status);
      const positions = result.data || [];
      set({
        positions,
        isLoading: false,
        message: result.message,
      });
      return positions;
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, "Unable to load broker positions."),
      });
      throw error;
    }
  },
  syncCTrader: async (connectionId) => {
    set({ isConnecting: true, error: null, message: null });

    try {
      const result = await syncCTraderService(connectionId);
      const [connections, positions] = await Promise.all([
        get().fetchConnections().catch(() => get().connections),
        get().fetchPositions("open").catch(() => get().positions),
      ]);
      set({
        isConnecting: false,
        isConnected: hasConnectedBroker(connections),
        connections,
        positions,
        lastSync: result.data,
        message: result.message,
      });
      return result.data;
    } catch (error) {
      set({
        isConnecting: false,
        error: getApiErrorMessage(error, "Unable to sync cTrader."),
      });
      throw error;
    }
  },
  disconnectCTrader: async (connectionId) => {
    set({ isConnecting: true, error: null, message: null });

    try {
      const result = await disconnectCTraderService(connectionId);
      const connections = await get().fetchConnections().catch(() =>
        get().connections.map((connection) =>
          connection.id === connectionId
            ? { ...connection, status: "disconnected" as const }
            : connection,
        ),
      );
      const positions = await get().fetchPositions("open").catch(() =>
        get().positions.filter((position) => position.status === "open"),
      );

      set({
        isConnecting: false,
        isConnected: hasConnectedBroker(connections),
        connections,
        positions,
        message: result.message,
      });
    } catch (error) {
      set({
        isConnecting: false,
        error: getApiErrorMessage(error, "Unable to disconnect cTrader."),
      });
      throw error;
    }
  },
  applyPositionLiveUpdate: (update) => {
    set((state) => ({
      positions: state.positions.map((position) => {
        if (position._id !== update.positionId) return position;

        const live = position.live || {};
        return {
          ...position,
          symbol: update.symbol || position.symbol,
          direction: update.side || position.direction,
          entryPrice: update.entryPrice ?? position.entryPrice,
          live: {
            currentBid: update.currentBid ?? live.currentBid,
            currentAsk: update.currentAsk ?? live.currentAsk,
            currentPrice: update.currentPrice ?? live.currentPrice,
            grossUnrealizedPnl:
              update.grossUnrealizedPnl ?? live.grossUnrealizedPnl,
            netUnrealizedPnl: update.netUnrealizedPnl ?? live.netUnrealizedPnl,
            floatingProfitIndicative:
              update.floatingProfitIndicative ?? live.floatingProfitIndicative,
            quoteTimestamp: update.quoteTimestamp ?? live.quoteTimestamp,
            pnlTimestamp: update.pnlTimestamp ?? live.pnlTimestamp,
            symbolDigits: update.symbolDigits ?? live.symbolDigits,
            pipPosition: update.pipPosition ?? live.pipPosition,
            durationMs: update.durationMs ?? live.durationMs,
            floatingPnlIsIndicative:
              update.floatingPnlIsIndicative ?? live.floatingPnlIsIndicative,
          },
        };
      }),
    }));
  },
  clearBrokerNotice: () => {
    set({ error: null, message: null });
  },
}));
