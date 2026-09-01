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
  };
  message: string;
}
