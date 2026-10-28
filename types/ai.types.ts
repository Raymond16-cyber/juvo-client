export interface AiMessage {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface AiConversationSummary {
  _id: string;
  title: string;
  preview: string;
  messageCount: number;
  lastMessageAt?: string;
  createdAt?: string;
}

export interface AiConversation {
  _id: string;
  title: string;
  messages: AiMessage[];
  lastMessageAt?: string;
}

export interface AiChatResponse {
  data: {
    conversationId: string;
    title: string;
    reply: string;
    messages: AiMessage[];
    usage?: AiUsageSnapshot;
  };
  message: string;
}

export interface AiAccessTrial {
  status: "available" | "active" | "expired";
  used: boolean;
  startedAt: string | null;
  expiresAt: string | null;
}

export type AiFeatureKey =
  | "juvo_ai"
  | "smart_journal_interviewer"
  | "plan_compliance_check"
  | "ai_period_review"
  | "ask_your_journal"
  | "explain_metrics"
  | "goal_coach"
  | "contextual_ai_checkins";

export interface AiFeatureAccess {
  feature: AiFeatureKey | string;
  plan: "free" | "pro" | "super";
  hasAccess: boolean;
  source: "subscription" | "trial" | null;
  trial: AiAccessTrial;
}

export interface AiUsageSnapshot {
  feature: string;
  periodKey: string;
  allowed: boolean;
  reason: string | null;
  limit: number | null;
  used: number;
  remaining: number | null;
}

export interface AiAccess {
  feature: "juvo_ai" | string;
  plan: "free" | "pro" | "super";
  hasAccess: boolean;
  source: "subscription" | "trial" | null;
  trial: AiAccessTrial;
  features?: Record<string, AiFeatureAccess>;
  usage?: Record<string, AiUsageSnapshot>;
}

export interface AiAccessResponse {
  data: AiAccess;
  message: string;
}

export interface JournalInterviewerResponse {
  message: string;
  data: {
    questions: string[];
    contentHash: string;
    generatedAt?: string;
    cached: boolean;
  };
  usage?: AiUsageSnapshot;
}

export interface ExplainMetricResponse {
  message: string;
  data: {
    metricKey: string;
    value: unknown;
    title: string;
    explanation: string;
    caveat: string;
  };
  usage?: AiUsageSnapshot;
}

export interface GoalCoachResponse {
  message: string;
  data: {
    goalId: string;
    action: "plan" | "progress" | "adjust";
    summary: string;
    steps: string[];
    question: string;
  };
  usage?: AiUsageSnapshot;
}

export interface AiCheckinResponse {
  message: string;
  data: {
    enabled: boolean;
    due: boolean;
    question: string | null;
    lastSentAt: string | null;
    cooldownHours: number;
    usage?: AiUsageSnapshot | null;
  };
}
