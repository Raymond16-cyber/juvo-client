export type BrokerProvider = "ctrader" | "metaapi";

export type BrokerPlatform = "ctrader" | "mt4" | "mt5";

export type BrokerConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "reauthorization_required";

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

export type BrokerPositionStatus = "open" | "closed" | "unknown";

export interface BrokerPosition {
  _id: string;
  userId?: string;
  provider: "ctrader";
  ctidTraderAccountId: string;
  externalPositionId: string;
  symbol: string;
  symbolId?: string;
  direction: "long" | "short";
  volume?: number;
  lotSize?: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  swap?: number;
  commission?: number;
  usedMargin?: number;
  moneyCurrency?: string | null;
  status: BrokerPositionStatus;
  openedAt?: string;
  brokerUpdatedAt?: string;
  syncedAt?: string;
  closedAt?: string;
  label?: string;
  comment?: string;
  live?: {
    currentBid?: number;
    currentAsk?: number;
    currentPrice?: number;
    grossUnrealizedPnl?: number;
    netUnrealizedPnl?: number;
    floatingProfitIndicative?: number;
    quoteTimestamp?: number;
    pnlTimestamp?: number;
    symbolDigits?: number;
    pipPosition?: number;
    durationMs?: number;
    floatingPnlIsIndicative?: boolean;
  };
  tradingAccount?:
    | string
    | {
        _id: string;
        accountName: string;
        accountNumber: string;
        broker: string;
        platform: string;
        currency: string;
        accountCurrency?: string;
      };
  createdAt?: string;
  updatedAt?: string;
}

export interface BrokerPositionLiveUpdate {
  positionId: string;
  tradingAccountId: string;
  provider: "ctrader";
  symbol: string;
  side: "long" | "short";
  entryPrice?: number;
  currentBid?: number;
  currentAsk?: number;
  currentPrice?: number;
  grossUnrealizedPnl?: number;
  netUnrealizedPnl?: number;
  floatingProfitIndicative?: number;
  quoteTimestamp?: number;
  pnlTimestamp?: number;
  symbolDigits?: number;
  pipPosition?: number;
  durationMs?: number;
  floatingPnlIsIndicative?: boolean;
}

export interface BrokerPositionsResponse {
  message: string;
  data: BrokerPosition[];
}

export interface CTraderSyncResult {
  connection: BrokerConnection;
  tradingAccountId: string;
  importedTrades: number;
  skippedDeals: number;
  openPositions: number;
  closedPositions: number;
  pendingOrders: number;
  hasMoreDeals: boolean;
}

export interface CTraderSyncResponse {
  message: string;
  data: CTraderSyncResult;
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
  data: BrokerConnection & {
    tradingAccountId?: string;
    sync?: Omit<CTraderSyncResult, "connection" | "tradingAccountId">;
  };
}
