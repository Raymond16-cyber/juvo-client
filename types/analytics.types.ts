export interface AnalyticsSummary {
  journals: number;
  trades: number;
  openTrades: number;
  closedTrades: number;
  netPnl: number;
  winRate: number;
  avgRr: number;
  avgRisk: number;
  avgDiscipline: number;
  wins: number;
  losses: number;
  revengeDays: number;
  overtradeDays: number;
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
    long: { trades: number; pnl: number };
    short: { trades: number; pnl: number };
  };
  insights: AnalyticsInsight[];
  accounts: Array<{
    _id: string;
    accountName: string;
    broker: string;
    currency: string;
    currentBalance: number;
    currentEquity?: number;
    profitTarget?: number;
    maxDrawnDown?: number;
    isConnected?: boolean;
  }>;
  startingBalance: number;
}
