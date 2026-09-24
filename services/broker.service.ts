import api from "@/lib/axios";
import {
  BrokerConnectionsResponse,
  BrokerConnection,
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

export async function getMetaTraderStatus() {
  return (await api.get<{ data: { enabled: boolean; url: string; connections: BrokerConnection[] } }>("/broker/metatrader/status")).data.data;
}

export async function createMetaTraderPairingCode() {
  return (await api.post<{ data: { code: string; expiresAt: string; apiUrl: string } }>("/broker/metatrader/pairing-code")).data.data;
}

export async function downloadMetaTraderConnector() {
  const result = await api.get<Blob>("/broker/metatrader/download", { responseType: "blob" });
  const url = URL.createObjectURL(result.data);
  const link = document.createElement("a");
  link.href = url; link.download = "JUVOConnector.mq5"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function manageMetaTraderConnection(id: string, action: "sync" | "disconnect") {
  await api.post(`/broker/metatrader/connections/${encodeURIComponent(id)}/${action}`, {});
}
