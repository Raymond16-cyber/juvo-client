export interface AnalyticsSummary {
  journals: number;
  trades: number;
  openTrades: number;
  closedTrades: number;
  netPnl: number;
  winRate: number;
  profitFactor: number;
  recoveryFactor: number;
  grossProfit: number;
  grossLoss: number;
  maxDrawdown: number;
  avgRr: number;
  avgRisk: number;
  avgDiscipline: number;
  wins: number;
  losses: number;
  revengeDays: number;
  overtradeDays: number;
  bestSession: {
    session: string;
    trades: number;
    pnl: number;
    winRate: number;
  } | null;
  worstSession: {
    session: string;
    trades: number;
    pnl: number;
    winRate: number;
  } | null;
}

export interface AnalyticsInsight {
  _id?: string;
  title: string;
  body: string;
  score: number;
  category: string;
  source?: string;
  createdAt?: string;
}

export interface AnalyticsData {
  currency?: string;
  reportingCurrency?: string;
  currencyMode?: "single" | "mixed" | "normalized";
  nativeCurrencyMode?: "single" | "mixed";
  conversionUnavailable?: boolean;
  conversionUnavailableCount?: number;
  monetaryTradesCount?: number;
  tradingAccount?: {
    _id: string;
    accountName: string;
    broker: string;
    currency: string;
    accountCurrency?: string;
    status?: "Active" | "Passed" | "Breached";
    isActive?: boolean;
  } | null;
  summary: AnalyticsSummary;
  equityCurve: Array<{
    date: string;
    label: string;
    pnl: number;
    equity: number;
    trades: number;
  }>;
  bySymbol: Array<{
    symbol: string;
    trades: number;
    pnl: number;
    wins: number;
    winRate: number;
  }>;
  bySession: Array<{
    session: string;
    trades: number;
    pnl: number;
    wins: number;
    winRate: number;
  }>;
  byDirection: {
    long: {
      trades: number;
      closedTrades: number;
      pnl: number;
      wins: number;
      losses: number;
      winRate: number;
    };
    short: {
      trades: number;
      closedTrades: number;
      pnl: number;
      wins: number;
      losses: number;
      winRate: number;
    };
  };
  insights: AnalyticsInsight[];
  accounts: Array<{
    _id: string;
    accountName: string;
    broker: string;
    currency: string;
    accountCurrency?: string;
    currentBalance: number;
    currentEquity?: number;
    profitTarget?: number;
    maxDrawnDown?: number;
    isConnected?: boolean;
    isActive?: boolean;
    status?: "Active" | "Passed" | "Breached";
    tradesCount?: number;
  }>;
  startingBalance: number;
}
