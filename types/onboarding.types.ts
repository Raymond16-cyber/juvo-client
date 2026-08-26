// export type TraderExperience = "new" | "developing" | "consistent" | "funded";

// export type TradingStyle =
//   | "scalper"
//   | "day_trader"
//   | "swing_trader"
//   | "position_trader";

// export type TradingGoal =
//   | "discipline"
//   | "profitability"
//   | "risk_control"
//   | "funded_account"
//   | "consistency"
//   | "analytics";

// export type RiskPreference = {
//   maxRiskPerTrade: string;
//   dailyLossLimit: string;
//   maxTradesPerDay: string;
//   usesStopLoss: boolean;
//   journalBeforeTrade: boolean;
// };

// export type PreferredMarket =
//   | "forex"
//   | "crypto"
//   | "stocks"
//   | "indices"
//   | "commodities"
//   | "futures";

// export type PreferredSession = "london" | "new_york" | "asia" | "overlap";

// export type AccountSetupChoice = "connect_now" | "manual" | "later";

// export type OnboardingData = {
//   experienceLevel: TraderExperience | "";
//   tradingStyle: TradingStyle | "";
//   goals: TradingGoal[];
//   risk: RiskPreference;
//   markets: PreferredMarket[];
//   sessions: PreferredSession[];
//   accountSetup: AccountSetupChoice | "";
// };

export interface OnboardingData {
  country: string;
  timezone: string;
  experienceLevel: string;
  tradingStyle: string;
  instruments: string[];
  biggestChallenges: string[];
  theme: string;
  preferredCurrency: string;
  weekStartsOn: string;
  notificationsEnabled: boolean;
  reminderTime: string;
  pushToken: string;
  currentStep: number;
}

export interface OnboardingResponse {
  message: string;
  user: unknown;
}
