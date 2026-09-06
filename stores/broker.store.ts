import { getApiErrorMessage } from "@/lib/axios";
import {
  brokerDebug,
  completeCTraderConnectService,
  getBrokerConnectionsService,
  getCTraderConnectUrlService,
} from "@/services/broker.service";
import { BrokerConnection } from "@/types/broker.types";
import { create } from "zustand";

interface BrokerState {
  isLoading: boolean;
  isConnecting: boolean;
  error: string | null;
  message: string | null;
  isConnected: boolean;
  connections: BrokerConnection[];
  startCTraderConnect: () => Promise<void>;
  completeCTraderConnect: (code: string) => Promise<void>;
  fetchConnections: () => Promise<BrokerConnection[]>;
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
  clearBrokerNotice: () => {
    set({ error: null, message: null });
  },
}));
