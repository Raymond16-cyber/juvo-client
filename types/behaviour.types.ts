export type ChallengeKey =
  | "fomo"
  | "revenge_trading"
  | "overtrading"
  | "impatience"
  | "poor_risk_management"
  | "emotional_trading"
  | "lack_of_discipline"
  | "inconsistent_strategy"
  | "overconfidence";

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
  evidence?: {
    kind?: string;
    description?: string;
    observedAt?: string;
    metrics?: Record<string, number | string | boolean | null>;
  } | null;
  associatedOutcome?: { amount: number; currency: string } | null;
  symbol?: string;
  direction?: string;
  scope?: "trade" | "journal";
}

export interface BehaviourEvidence {
  date: string | null;
  source: "user_reported" | "confirmed_inference" | "inference";
  status: "confirmed" | "dismissed" | "suggested";
  confidence: number | null;
  description: string;
  symbol: string | null;
  direction: string | null;
  associatedOutcome: { amount: number; currency: string } | null;
}

export interface BehaviourReport {
  challenge: ChallengeKey | string;
  attention:
    | "confirmed_observation"
    | "review_suggested"
    | "no_confirmed_observation";
  occurrences: number;
  suggestedOccurrences: number;
  reviewedObservations: number;
  confidence: number | null;
  trend: "more_recorded" | "fewer_recorded" | "unchanged";
  comparisonOccurrences: number;
  evidence: BehaviourEvidence[];
  recommendation: string | null;
  interpretation: string;
}

export interface BehaviouralObjective {
  _id: string;
  title: string;
  description?: string;
  behaviorChallenge: ChallengeKey | string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  status: "Active" | "Completed" | "Failed" | "Archived";
  progressSource: "reviewed_observations";
}

export interface BehaviourOverview {
  challenges: string[];
  progress: ChallengeProgressEntry[];
  pendingFlags: BehaviourFlag[];
  reports: {
    period: {
      days: number;
      from: string;
      to: string;
      comparisonFrom: string;
      comparisonTo: string;
    };
    dataAvailability: {
      trades: number;
      journals: number;
      sufficientForComparison: boolean;
      message: string | null;
    };
    documentedAdherence: {
      source: "completed_journal_self_report";
      currentPeriod: number;
      comparisonPeriod: number;
      reviewedSessions: number;
      trend: "more_documented" | "fewer_documented" | "unchanged";
      interpretation: string;
    };
    observations: BehaviourReport[];
  };
  goals: BehaviouralObjective[];
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
