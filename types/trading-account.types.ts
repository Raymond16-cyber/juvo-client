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
