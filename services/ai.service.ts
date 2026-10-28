import api from "@/lib/axios";
import {
  AiAccessResponse,
  AiChatResponse,
  AiCheckinResponse,
  AiConversation,
  AiConversationSummary,
  ExplainMetricResponse,
  GoalCoachResponse,
  JournalInterviewerResponse,
} from "@/types/ai.types";

export const getAiAccessService = async () => {
  const response = await api.get<AiAccessResponse>("/ai/access");
  return response.data;
};

export const startAiTrialService = async () => {
  const response = await api.post<AiAccessResponse>("/ai/trial/start");
  return response.data;
};

export const listConversationsService = async () => {
  const response = await api.get<{ data: AiConversationSummary[] }>(
    "/ai/conversations",
  );
  return response.data;
};

export const getConversationService = async (conversationId: string) => {
  const response = await api.get<{ data: AiConversation }>(
    `/ai/conversations/${conversationId}`,
  );
  return response.data;
};

export const deleteConversationsService = async (conversationIds: string[]) => {
  const response = await api.delete<{ data: { deletedCount: number } }>(
    "/ai/conversations",
    { data: { conversationIds } },
  );
  return response.data;
};

export const chatWithJuvoService = async (payload: {
  message: string;
  conversationId?: string;
  journalIds?: string[];
}) => {
  const response = await api.post<AiChatResponse>("/ai/chat", payload, {
    timeout: 60000,
  });
  return response.data;
};

export const journalInterviewerService = async (payload: {
  journalId?: string;
  tradeId?: string;
  noTradeDayId?: string;
  entrySnapshot?: Record<string, unknown>;
  forceRefresh?: boolean;
}) => {
  const response = await api.post<JournalInterviewerResponse>(
    "/ai/journal-interviewer",
    payload,
    { timeout: 60000 },
  );
  return response.data;
};

export const planComplianceService = async (payload: {
  journalId: string;
  tradeId?: string;
}) => {
  const response = await api.post("/ai/plan-compliance", payload, {
    timeout: 60000,
  });
  return response.data;
};

export const periodReviewService = async (payload: {
  period: "week" | "month";
  anchorDate?: string;
  forceRefresh?: boolean;
}) => {
  const response = await api.post("/ai/period-review", payload, {
    timeout: 60000,
  });
  return response.data;
};

export const explainMetricService = async (payload: {
  metricKey: string;
  dateFrom?: string;
  dateTo?: string;
  comparisonFrom?: string;
  comparisonTo?: string;
}) => {
  const response = await api.post<ExplainMetricResponse>(
    "/ai/explain-metric",
    payload,
    { timeout: 60000 },
  );
  return response.data;
};

export const goalCoachService = async (payload: {
  goalId: string;
  action?: "plan" | "progress" | "adjust";
}) => {
  const response = await api.post<GoalCoachResponse>("/ai/goal-coach", payload, {
    timeout: 60000,
  });
  return response.data;
};

export const getAiCheckinService = async (options?: {
  preferencesOnly?: boolean;
}) => {
  const response = await api.get<AiCheckinResponse>("/ai/checkins", {
    params: options?.preferencesOnly ? { preferencesOnly: "1" } : undefined,
  });
  return response.data;
};

export const updateAiCheckinPreferencesService = async (payload: {
  enabled?: boolean;
  cooldownHours?: number;
}) => {
  const response = await api.put<AiCheckinResponse>(
    "/ai/checkins/preferences",
    payload,
  );
  return response.data;
};

export function hasAiFeature(
  access: AiAccessResponse["data"] | null | undefined,
  feature: string,
) {
  if (!access) return false;
  if (access.features?.[feature]) {
    return Boolean(access.features[feature].hasAccess);
  }
  if (feature === "juvo_ai") return Boolean(access.hasAccess);
  return false;
}
