"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import { controlClassName } from "@/lib/ui";
import { getApiErrorMessage } from "@/lib/axios";
import {
  chatWithJuvoService,
  getConversationService,
  listConversationsService,
} from "@/services/ai.service";
import { AiConversationSummary, AiMessage } from "@/types/ai.types";
import { Bot, Plus, Send, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";

const prompts = [
  "What process leak shows up most in my last journals?",
  "Help me write a pre-market note for today.",
  "Where am I most likely to revenge trade?",
  "Review my risk and size discipline.",
];

export default function JuvoAIChatPage() {
  const [conversations, setConversations] = useState<AiConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const response = await listConversationsService();
      setConversations(response.data);
    } catch {
      // Empty history is a valid first-run state.
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const startNew = () => {
    setConversationId(undefined);
    setMessages([]);
    setError(null);
  };

  const openConversation = async (id: string) => {
    setConversationId(id);
    const response = await getConversationService(id);
    setMessages(response.data.messages || []);
  };

  const sendMessage = async (text: string) => {
    const content = text.trim();
    if (!content || isLoading) return;

    setInput("");
    setError(null);
    setMessages((current) => [...current, { role: "user", content }]);
    setIsLoading(true);

    try {
      const response = await chatWithJuvoService({
        message: content,
        conversationId,
      });
      setConversationId(response.data.conversationId);
      setMessages(response.data.messages);
      await loadConversations();
    } catch (sendError) {
      setError(
        getApiErrorMessage(
          sendError,
          "Juvo could not reply. Try again in a moment.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <DashboardShell>
      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Juvo AI
              </p>
              <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                Conversations
              </h2>
            </div>
            <Button variant="ghost" className="h-10 px-3" onClick={startNew}>
              <Plus size={16} />
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            {conversations.length ? (
              conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  type="button"
                  onClick={() => openConversation(conversation._id)}
                  className={`w-full rounded-2xl px-3 py-3 text-left transition ${
                    conversationId === conversation._id
                      ? "bg-slate-950 text-white dark:bg-primary dark:text-slate-950"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  <p className="truncate text-sm font-semibold">{conversation.title}</p>
                  <p className="mt-1 truncate text-xs opacity-70">
                    {conversation.preview || "No messages yet"}
                  </p>
                </button>
              ))
            ) : (
              <p className="px-1 text-sm text-slate-500 dark:text-slate-400">
                Ask Juvo about your journal, risk, or psychology.
              </p>
            )}
          </div>
        </aside>

        <section className="flex min-h-[70vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-card">
          <div className="border-b border-slate-200 p-5 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Bot size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-950 dark:text-white">
                  Process coach
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Juvo reads your journals. It will not give trade signals.
                </p>
              </div>
            </div>
          </div>

          <div ref={scrollerRef} className="flex-1 space-y-4 overflow-y-auto p-5">
            {!messages.length && !isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-sm text-slate-600 transition hover:border-primary hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    <Sparkles size={16} className="mb-2 text-primary" />
                    {prompt}
                  </button>
                ))}
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "ml-auto bg-slate-950 text-white dark:bg-primary dark:text-slate-950"
                      : "bg-slate-50 text-slate-700 dark:bg-white/[0.04] dark:text-slate-200"
                  }`}
                >
                  {message.content}
                </div>
              ))
            )}
            {isLoading ? (
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-white/[0.04] dark:text-slate-400">
                Juvo is reading your journal...
              </div>
            ) : null}
            {error ? (
              <div className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
                {error}
              </div>
            ) : null}
          </div>

          <form
            className="border-t border-slate-200 p-4 dark:border-white/10"
            onSubmit={handleSubmit}
          >
            <div className="flex items-end gap-3">
              <textarea
                className={`${controlClassName} min-h-[52px] py-3`}
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about your process, not the next setup"
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="h-12 px-4">
                <Send size={16} />
              </Button>
            </div>
          </form>
        </section>
      </div>
    </DashboardShell>
  );
}
