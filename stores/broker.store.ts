import { getApiErrorMessage } from "@/lib/axios";
import {
  brokerDebug,
  completeCTraderConnectService,
  getBrokerConnectionsService,
  getBrokerPositionsService,
  getCTraderConnectUrlService,
  syncCTraderService,
} from "@/services/broker.service";
import {
  BrokerConnection,
  BrokerPosition,
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
    brokerDebug("store:startCTraderConnect");
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

      brokerDebug("store:redirecting-to-ctrader", {
        authorizationUrl: result.authorizationUrl,
      });

      window.location.href = result.authorizationUrl;
    } catch (error) {
      brokerDebug("store:startCTraderConnect:error", error);
      set({
        isConnecting: false,
        error: getApiErrorMessage(error, "Broker connection failed"),
        message: null,
        isConnected: false,
      });
    }
  },
  completeCTraderConnect: async (code) => {
    brokerDebug("store:completeCTraderConnect", {
      codeLength: code?.length || 0,
    });
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
      brokerDebug("store:completeCTraderConnect:error", error);
      set({
        isConnecting: false,
        error: getApiErrorMessage(error, "Broker connection failed"),
        message: null,
      });
      throw error;
    }
  },
  fetchConnections: async () => {
    brokerDebug("store:fetchConnections");
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
      brokerDebug("store:fetchConnections:error", error);
      set({
        isLoading: false,
        error: getApiErrorMessage(error, "Unable to load broker connections."),
      });
      throw error;
    }
  },
  fetchPositions: async (status) => {
    brokerDebug("store:fetchPositions", { status });
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
      brokerDebug("store:fetchPositions:error", error);
      set({
        isLoading: false,
        error: getApiErrorMessage(error, "Unable to load broker positions."),
      });
      throw error;
    }
  },
  syncCTrader: async (connectionId) => {
    brokerDebug("store:syncCTrader", { connectionId });
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
      brokerDebug("store:syncCTrader:error", error);
      set({
        isConnecting: false,
        error: getApiErrorMessage(error, "Unable to sync cTrader."),
      });
      throw error;
    }
  },
  clearBrokerNotice: () => {
    set({ error: null, message: null });
  },
}));
