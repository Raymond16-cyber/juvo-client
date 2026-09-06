export type BrokerProvider = "ctrader" | "metaapi";

export type BrokerPlatform = "ctrader" | "mt4" | "mt5";

export type BrokerConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export type BrokerAccountType = "demo" | "live";

export interface BrokerConnection {
  id: string;
  userId?: string;
  provider: BrokerProvider;
  platform: BrokerPlatform;
  externalAccountId?: string;
  brokerName?: string;
  accountNumber?: string;
  accountType?: BrokerAccountType;
  status: BrokerConnectionStatus;
  lastSyncedAt?: string | null;
  connectedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CTraderConnectResponse {
  message: string;
  authorizationUrl: string;
}

export interface BrokerConnectionsResponse {
  message: string;
  data: BrokerConnection[];
}

export interface CompleteCTraderResponse {
  message: string;
  data: BrokerConnection;
}
