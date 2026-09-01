import api from "@/lib/axios";
import {
  AiChatResponse,
  AiConversation,
  AiConversationSummary,
} from "@/types/ai.types";

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
  const response = await api.post<AiChatResponse>("/ai/chat", payload);
  return response.data;
};
