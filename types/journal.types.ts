import { NewlyEarnedAchievement } from "@/types/achievement.types";
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
        | "accountCurrency"
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
  profitLossCurrency?: string | null;
  source?: "manual" | "ctrader" | "metatrader";
  platform?: "ctrader" | "mt4" | "mt5";
  brokerMetadata?: {
    magic?: number | string;
    comment?: string;
    origin?: "manual" | "ea" | "unknown";
  };
  externalId?: string;
  externalPositionId?: string;
  externalOrderId?: string;
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
  profitLossReporting?: number | null;
  profitLossCurrency?: string | null;
  plannedRR: number;
  achievedRR?: number;
  source?: "manual" | "ctrader" | "metatrader";
  platform?: "ctrader" | "mt4" | "mt5";
  brokerMetadata?: {
    magic?: number | string;
    comment?: string;
    origin?: "manual" | "ea" | "unknown";
  };
  externalId?: string;
  externalPositionId?: string;
  externalOrderId?: string;
  session?: CreateTradePayload["session"];
  openedAt?: string;
  closedAt?: string;
  createdAt?: string;
  tradingAccount?:
    | string
    | Pick<
        TradingAccount,
        | "_id"
        | "accountName"
        | "broker"
        | "currency"
        | "accountCurrency"
        | "status"
        | "isActive"
      >;
}

export interface JournalHistoryItem extends JournalSummary {
  trades?: JournalListTradeSummary[];
  totalProfitLoss: number;
  totalProfitLossReporting?: number;
  reportingCurrency?: string;
  conversionUnavailableCount?: number;
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

export interface ScreenshotReviewSections {
  chartObservations: string;
  marketStructure: string;
  setupAnalysis: string;
  entryExitReview: string;
  riskManagement: string;
  whatWentWell: string;
  whatCouldBeImproved: string;
  keyLesson: string;
  confidenceAndLimitations: string;
}

export interface TradeScreenshotAnalysis {
  status: "ready";
  mimeType?: string | null;
  model?: string | null;
  analyzedAt?: string | null;
  review: ScreenshotReviewSections;
  imageUrl?: string | null;
  imageExpiresAt?: string | null;
}

export interface JournalDetailTrade extends JournalListTradeSummary {
  pips?: number;
  screenshots?: string[];
  entryPrice?: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize?: number;
  riskPercentage?: number;
  notes?: string;
  screenshotAnalysis?: TradeScreenshotAnalysis;
}

export interface JournalDetail extends JournalHistoryItem {
  trades?: JournalDetailTrade[];
}

export interface JournalExport {
  schemaVersion: number;
  exportedAt: string;
  timeZone: string;
  reportingCurrency: string;
  journals: JournalDetail[];
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

export interface JournalStreakDay {
  date: string;
  completed: boolean;
  isToday: boolean;
}

export interface JournalStreakData {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  todayKey: string;
  lastQualifyingJournalDayKey?: string | null;
  lastQualifyingJournalAt?: string | null;
  week: JournalStreakDay[];
  headline: string;
  message: string;
}

export interface JournalStreakResponse {
  data: JournalStreakData;
  message: string;
}

export type NoTradeDayReason =
  | "no_valid_setup"
  | "followed_plan"
  | "rest_day"
  | "market_unsuitable"
  | "other";

export interface NoTradeDayEntry {
  _id: string;
  localDayKey: string;
  timezone: string;
  confirmed: boolean;
  reason?: NoTradeDayReason | null;
  reflection?: string;
  recordedAt?: string;
  supersededByTrade?: boolean;
  supersededAt?: string | null;
  liftedAt?: string | null;
  liftNote?: string;
  isActive?: boolean;
  journal?: string | null;
  tradingAccount?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NoTradeDayPayload {
  confirmed?: boolean;
  reason?: NoTradeDayReason | null;
  reflection?: string;
  tradingAccount?: string | null;
}

export interface NoTradeDayResponse {
  success?: boolean;
  message: string;
  created?: boolean;
  newlyEarned?: NewlyEarnedAchievement[];
  data: {
    entry: NoTradeDayEntry;
    streak?: JournalStreakData | null;
    message?: string;
  };
}

export type JournalingStatus =
  | "not_started"
  | "day_started"
  | "preparation_recorded"
  | "trade_recorded"
  | "review_completed"
  | "no_trade_day";

export interface JournalStatusData {
  hasJournalToday: boolean;
  journal: JournalSummary | null;
  date: string;
  timeZone: string;
  streak?: JournalStreakData | null;
  noTradeDay?: NoTradeDayEntry | null;
  journalingStatus?: JournalingStatus;
}

export interface JournalStatusResponse {
  data: JournalStatusData;
  message: string;
  newlyEarned?: NewlyEarnedAchievement[];
}

export interface CreateTradeResponse {
  data: TradeSummary;
  message: string;
  attachedToAccount?: boolean;
  newlyEarned?: NewlyEarnedAchievement[];
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
  newlyEarned?: NewlyEarnedAchievement[];
}

export interface BeforeTradingAudioResponse {
  message: string;
  data: {
    beforeTradingAudio: {
      publicId: string;
      format: string;
      bytes: number;
      duration: number | null;
    };
  };
}

export interface BeforeTradingAudioPlaybackResponse {
  message: string;
  data: {
    playbackUrl: string;
    expiresAt: number;
  };
}

export interface ScreenshotReviewResponse {
  success: boolean;
  message: string;
  reused?: boolean;
  data: TradeScreenshotAnalysis & {
    tradeId: string;
  };
}
