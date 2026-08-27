import { TradingAccount } from "@/types/trading-account.types";

export interface JournalSummary {
  _id: string;
  journalDate: string;
  status: "Started" | "Completed";
  tradingAccount?: string | Pick<
    TradingAccount,
    | "_id"
    | "accountName"
    | "accountNumber"
    | "broker"
    | "accountType"
    | "currency"
    | "currentBalance"
    | "currentEquity"
  >;
  tradesCount?: number;
  psychology?: {
    beforeTrading?: string;
    confidenceBefore?: number;
    afterTrading?: string;
    confidenceAfter?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type CreateJournalPayload = {
  tradingAccount: string;
  beforeTrading?: string;
  confidenceBefore?: number;
};

export type CreateTradePayload = {
  symbol: string;
  instrument: "forex" | "stocks" | "crypto" | "commodities" | "indices" | "others";
  direction: "long" | "short";
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  riskPercentage: number;
  plannedRR: number;
  session?: "Asian" | "Tokyo" | "London" | "New York";
  notes?: string;
};

export interface TradeSummary extends CreateTradePayload {
  _id: string;
  status: "Open" | "Closed" | "Breakeven" | "Cancelled";
  profitLoss: number;
  openedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalStatusData {
  hasJournalToday: boolean;
  journal: JournalSummary | null;
  date: string;
  timeZone: string;
}

export interface JournalStatusResponse {
  data: JournalStatusData;
  message: string;
}

export interface CreateTradeResponse {
  data: TradeSummary;
  message: string;
}
