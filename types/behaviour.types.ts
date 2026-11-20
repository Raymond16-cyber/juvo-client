export type ChallengeKey =
  | "fomo"
  | "revenge_trading"
  | "overtrading"
  | "impatience"
  | "poor_risk_management"
  | "emotional_trading"
  | "lack_of_discipline"
  | "inconsistent_strategy";

export type ChallengeProgressStatus =
  | "active"
  | "improving"
  | "overcome"
  | "paused";

export interface ChallengeProgressEntry {
  challenge: ChallengeKey | string;
  status: ChallengeProgressStatus;
  flagCount: number;
  confirmedCount: number;
  lastFlaggedAt?: string | null;
  streakWithoutFlag: number;
  tip?: string | null;
}

export interface BehaviourFlag {
  id: string;
  challenge: ChallengeKey | string;
  source: "auto" | "manual";
  confidence: number;
  confirmed: boolean | null;
  dismissedAt?: string | null;
  createdAt?: string;
  tip?: string | null;
  tradeId?: string;
  journalId?: string;
  journalDate?: string;
  symbol?: string;
  direction?: string;
  scope?: "trade" | "journal";
}

export interface BehaviourOverview {
  challenges: string[];
  progress: ChallengeProgressEntry[];
  pendingFlags: BehaviourFlag[];
}

export interface BehaviourOverviewResponse {
  message: string;
  data: BehaviourOverview;
}

export interface BehaviourFlagActionPayload {
  flagId: string;
  tradeId?: string;
  journalId?: string;
}
