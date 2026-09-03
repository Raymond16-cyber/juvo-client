export type TradingAccountStatus = "Active" | "Passed" | "Breached";

export interface TradingAccountTrade {
  _id: string;
  symbol: string;
  instrument: "forex" | "stocks" | "crypto" | "commodities" | "indices" | "others";
  direction: "long" | "short";
  status: "Open" | "Closed" | "Breakeven" | "Cancelled";
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize?: number;
  riskPercentage?: number;
  profitLoss: number;
  plannedRR?: number;
  achievedRR?: number;
  session?: "Asian" | "Tokyo" | "London" | "New York";
  notes?: string;
  openedAt?: string;
  closedAt?: string;
  createdAt?: string;
}

export interface TradingAccount {
  _id: string;
  accountName: string;
  accountNumber: string;
  accountType: "live" | "demo" | "prop" | "challenge";
  broker: string;
  initialBalance: number;
  currentBalance: number;
  platform: string;
  server?: string;
  leverage: string;
  currency: string;
  currentEquity: number;
  maxDrawnDown: number;
  profitTarget: number;
  isConnected: boolean;
  isActive?: boolean;
  status?: TradingAccountStatus;
  statusUpdatedAt?: string | null;
  trades?: TradingAccountTrade[];
  tradesCount?: number;
  totalProfitLoss?: number;
  openTrades?: number;
  closedTrades?: number;
  winningTrades?: number;
  losingTrades?: number;
  profitPercent?: number;
  drawdownPercent?: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateTradingAccountPayload = {
  accountName: string;
  accountNumber: string;
  accountType: TradingAccount["accountType"];
  broker: string;
  initialBalance: number;
  platform: string;
  server?: string;
  leverage: string;
  currency: string;
  maxDrawnDown: number;
  profitTarget: number;
};

export interface TradingAccountsResponse {
  data: TradingAccount[];
  message: string;
}

export interface CreateTradingAccountResponse {
  data: TradingAccount;
  message: string;
}

export interface TradingAccountOutcome {
  _id: string;
  accountName: string;
  broker?: string;
  currency?: string;
  currentBalance: number;
  currentEquity: number;
  initialBalance?: number;
  profitTarget?: number;
  maxDrawnDown?: number;
  status: TradingAccountStatus;
  isActive: boolean;
  profitPercent: number;
  drawdownPercent: number;
  statusChanged: boolean;
}
