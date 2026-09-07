import api from "@/lib/axios";
import {
  AiAccessResponse,
  AiChatResponse,
  AiConversation,
  AiConversationSummary,
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

export const chatWithJuvoService = async (payload: {
  message: string;
  conversationId?: string;
}) => {
  const response = await api.post<AiChatResponse>("/ai/chat", payload, {
    timeout: 60000,
  });
  return response.data;
};
