export const EXPERIENCE_LEVELS = [
  {
    value: "beginner",
    label: "Beginner",
    description: "I'm still learning the fundamentals.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "I understand trading and have some experience.",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "I've been trading consistently for some time.",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Trading is a serious part of my income.",
  },
];

export const TRADING_STYLES = [
  {
    value: "scalping",
    label: "Scalping",
  },
  {
    value: "day_trading",
    label: "Day Trading",
  },
  {
    value: "swing_trading",
    label: "Swing Trading",
  },
  {
    value: "position_trading",
    label: "Position Trading",
  },
];

export const INSTRUMENTS = [
  "forex",
  "crypto",
  "stocks",
  "indices",
  "commodities",
  "futures",
];

export const CHALLENGES = [
  "fomo",
  "revenge_trading",
  "overtrading",
  "impatience",
  "poor_risk_management",
  "emotional_trading",
  "lack_of_discipline",
  "inconsistent_strategy",
];

export const CHALLENGE_TIPS: Record<string, string> = {
  fomo: "Wait for your checklist setup. Missing a move costs less than forcing one.",
  revenge_trading: "After a loss, take a cool-down before the next entry.",
  overtrading: "Cap daily trades. Quality setups beat volume.",
  impatience: "Let the setup come to you. Early entries erode R.",
  poor_risk_management: "Keep risk per trade within your plan (often ≤1–2%).",
  emotional_trading: "Name the feeling before you click. Journal first if needed.",
  lack_of_discipline: "Follow the written plan for the next three trades only.",
  inconsistent_strategy: "Pick one playbook for the session and stick to it.",
};

export const CHALLENGE_TO_DISCIPLINE: Record<
  string,
  "revengeTraded" | "overTraded" | "followedRiskManagement" | "followedTradingPlan" | "respectedStopLoss"
> = {
  revenge_trading: "revengeTraded",
  overtrading: "overTraded",
  poor_risk_management: "followedRiskManagement",
  lack_of_discipline: "followedTradingPlan",
  inconsistent_strategy: "followedTradingPlan",
};

export const THEMES = [
  {
    value: "dark",
    label: "Dark",
  },
  {
    value: "light",
    label: "Light",
  },
  {
    value: "system",
    label: "System",
  },
];

export const CURRENCIES = [
  {
    value: "USD",
    label: "US Dollar ($)",
  },
  {
    value: "NGN",
    label: "Nigerian Naira (₦)",
  },
  {
    value: "GBP",
    label: "British Pound (£)",
  },
  {
    value: "EUR",
    label: "Euro (€)",
  },
];

export const WEEK_START_OPTIONS = [
  {
    value: "monday",
    label: "Monday",
  },
  {
    value: "sunday",
    label: "Sunday",
  },
];
