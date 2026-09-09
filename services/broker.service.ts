import api from "@/lib/axios";
import {
  BrokerConnectionsResponse,
  BrokerPositionsResponse,
  CompleteCTraderResponse,
  CTraderDisconnectResponse,
  CTraderSyncResponse,
  CTraderConnectResponse,
} from "@/types/broker.types";

export const getCTraderConnectUrlService = async () => {
  const response = await api.get<CTraderConnectResponse>(
    "/broker/ctrader/connect",
  );

  return response.data;
};

export const completeCTraderConnectService = async (code: string) => {
  const response = await api.post<CompleteCTraderResponse>(
    "/broker/ctrader/callback",
    { code },
  );

  return response.data;
};

export const getBrokerConnectionsService = async () => {
  const response = await api.get<BrokerConnectionsResponse>(
    "/broker/connections",
  );

  return response.data;
};

export const getBrokerPositionsService = async (status?: string) => {
  const response = await api.get<BrokerPositionsResponse>("/broker/positions", {
    params: status ? { status } : undefined,
  });

  return response.data;
};

export const syncCTraderService = async (connectionId?: string) => {
  const response = await api.post<CTraderSyncResponse>("/broker/ctrader/sync", {
    connectionId,
  });

  return response.data;
};

export const disconnectCTraderService = async (connectionId: string) => {
  const response = await api.post<CTraderDisconnectResponse>(
    "/broker/ctrader/disconnect",
    { connectionId },
  );

  return response.data;
};
