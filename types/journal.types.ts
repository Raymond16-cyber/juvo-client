import {
  TradingAccount,
  TradingAccountOutcome,
} from "@/types/trading-account.types";

export interface JournalSummary {
  _id: string;
  journalDate: string;
  status: "Started" | "Completed";
  tradingAccount?:
    | string
    | Pick<
        TradingAccount,
        | "_id"
        | "accountName"
        | "accountNumber"
        | "broker"
        | "accountType"
        | "currency"
        | "currentBalance"
        | "currentEquity"
        | "isActive"
        | "status"
        | "profitTarget"
        | "maxDrawnDown"
        | "initialBalance"
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
  instrument:
    | "forex"
    | "stocks"
    | "crypto"
    | "commodities"
    | "indices"
    | "others";
  direction: "long" | "short";
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  riskPercentage: number;
  plannedRR: number;
  session?: "Asian" | "Tokyo" | "London" | "New York";
  notes?: string;
  tradingAccount?: string;
};

export interface TradeSummary extends CreateTradePayload {
  _id: string;
  status: "Open" | "Closed" | "Breakeven" | "Cancelled";
  profitLoss: number;
  openedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalListTradeSummary {
  _id: string;
  symbol: string;
  instrument: CreateTradePayload["instrument"];
  direction: CreateTradePayload["direction"];
  status: TradeSummary["status"];
  profitLoss: number;
  plannedRR: number;
  achievedRR?: number;
  session?: CreateTradePayload["session"];
  openedAt?: string;
  closedAt?: string;
  createdAt?: string;
  tradingAccount?:
    | string
    | Pick<
        TradingAccount,
        "_id" | "accountName" | "broker" | "currency" | "status" | "isActive"
      >;
}

export interface JournalHistoryItem extends JournalSummary {
  trades?: JournalListTradeSummary[];
  totalProfitLoss: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  review?: {
    biggestMistake?: string;
    biggestWin?: string;
    lessonLearned?: string;
    improvementsTomorrow?: string;
    overallThoughts?: string;
  };
  discipline?: {
    followedTradingPlan?: boolean;
    followedRiskManagement?: boolean;
    revengeTraded?: boolean;
    overTraded?: boolean;
    respectedStopLoss?: boolean;
    score?: number;
  };
  ai?: {
    feedback?: string;
    summary?: string;
  };
}

export interface JournalDetailTrade extends JournalListTradeSummary {
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize?: number;
  riskPercentage?: number;
  notes?: string;
}

export interface JournalDetail extends JournalHistoryItem {
  trades?: JournalDetailTrade[];
}

export type CompleteJournalPayload = {
  afterTrading?: string;
  confidenceAfter?: number;
  biggestMistake?: string;
  biggestWin?: string;
  lessonLearned?: string;
  improvementsTomorrow?: string;
  overallThoughts?: string;
  followedTradingPlan?: boolean;
  followedRiskManagement?: boolean;
  revengeTraded?: boolean;
  overTraded?: boolean;
  respectedStopLoss?: boolean;
};

export type CloseTradePayload = {
  exitPrice: number;
  status?: "Closed" | "Breakeven" | "Cancelled";
  profitLoss?: number;
  achievedRR?: number;
  notes?: string;
};

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
  attachedToAccount?: boolean;
}

export interface CloseTradeResponse {
  data: TradeSummary;
  message: string;
  tradingAccount?: TradingAccountOutcome | null;
}

export interface UserJournalsResponse {
  data: JournalHistoryItem[];
  message: string;
}

export interface JournalDetailResponse {
  data: JournalDetail;
  message: string;
}
