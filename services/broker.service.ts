import api from "@/lib/axios";
import {
  BrokerConnectionsResponse,
  CompleteCTraderResponse,
  CTraderConnectResponse,
} from "@/types/broker.types";

function brokerDebug(step: string, details?: unknown) {
  if (process.env.NODE_ENV === "production") return;
  if (details === undefined) {
    console.log(`[broker] ${step}`);
    return;
  }
  console.log(`[broker] ${step}`, details);
}

export const getCTraderConnectUrlService = async () => {
  brokerDebug("connect:request", { url: "/broker/ctrader/connect" });

  const response = await api.get<CTraderConnectResponse>(
    "/broker/ctrader/connect",
  );

  brokerDebug("connect:response", {
    status: response.status,
    message: response.data?.message,
    hasAuthorizationUrl: Boolean(response.data?.authorizationUrl),
    authorizationUrl: response.data?.authorizationUrl,
  });

  return response.data;
};

export const completeCTraderConnectService = async (code: string) => {
  brokerDebug("complete:request", {
    url: "/broker/ctrader/callback",
    codeLength: code?.length || 0,
  });

  const response = await api.post<CompleteCTraderResponse>(
    "/broker/ctrader/callback",
    { code },
  );

  brokerDebug("complete:response", {
    status: response.status,
    message: response.data?.message,
    connection: response.data?.data,
  });

  return response.data;
};

export const getBrokerConnectionsService = async () => {
  brokerDebug("connections:request", { url: "/broker/connections" });

  const response = await api.get<BrokerConnectionsResponse>(
    "/broker/connections",
  );

  brokerDebug("connections:response", {
    status: response.status,
    count: response.data?.data?.length || 0,
    connections: response.data?.data,
  });

  return response.data;
};

export { brokerDebug };
