"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/axios";
import { controlClassName } from "@/lib/ui";
import {
  chatWithJuvoService,
  getConversationService,
  listConversationsService,
} from "@/services/ai.service";
import { AiConversationSummary, AiMessage } from "@/types/ai.types";
import { Bot, ChevronDown, MessageSquare, Plus, Send, Sparkles, X } from "lucide-react";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

const prompts = [
  "What process leak shows up most in my last journals?",
  "Help me write a pre-market note for today.",
  "Where am I most likely to revenge trade?",
  "Review my risk and size discipline.",
];

const NEAR_BOTTOM_PX = 96;

function isNearBottom(element: HTMLElement) {
  return element.scrollHeight - element.scrollTop - element.clientHeight < NEAR_BOTTOM_PX;
}

export default function JuvoAIChatPage() {
  const [conversations, setConversations] = useState<AiConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showJump, setShowJump] = useState(false);
  const [threadsOpen, setThreadsOpen] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);

  const loadConversations = async () => {
    try {
      const response = await listConversationsService();
      setConversations(response.data);
    } catch {
      // Empty history is a valid first-run state.
    }
  };

  const scrollToLatest = (smooth = true) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollTo({
      top: scroller.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    stickToBottomRef.current = true;
    setShowJump(false);
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!stickToBottomRef.current) {
      const scroller = scrollerRef.current;
      if (scroller) setShowJump(!isNearBottom(scroller));
      return;
    }
    scrollToLatest(true);
  }, [messages, isLoading]);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const atBottom = isNearBottom(scroller);
    stickToBottomRef.current = atBottom;
    setShowJump(!atBottom);
  };

  const startNew = () => {
    setConversationId(undefined);
    setMessages([]);
    setError(null);
    setThreadsOpen(false);
    stickToBottomRef.current = true;
  };

  const openConversation = async (id: string) => {
    setConversationId(id);
    setThreadsOpen(false);
    stickToBottomRef.current = true;
    const response = await getConversationService(id);
    setMessages(response.data.messages || []);
  };

  const sendMessage = async (text: string) => {
    const content = text.trim();
    if (!content || isLoading) return;

    setInput("");
    setError(null);
    stickToBottomRef.current = true;
    setMessages((current) => [...current, { role: "user", content }]);
    setIsLoading(true);
    requestAnimationFrame(() => scrollToLatest(true));

    try {
      const response = await chatWithJuvoService({
        message: content,
        conversationId,
      });
      setConversationId(response.data.conversationId);
      stickToBottomRef.current = true;
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

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const conversationList = (
    <div className="flex min-h-0 flex-1 flex-col">
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
      <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
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
    </div>
  );

  return (
    <DashboardShell fillViewport>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden xl:grid xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-4">
        <aside className="hidden min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-card xl:flex xl:flex-col">
          {conversationList}
        </aside>

        {threadsOpen ? (
          <div className="fixed inset-0 z-[60] xl:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              aria-label="Close conversations"
              onClick={() => setThreadsOpen(false)}
            />
            <div className="absolute inset-x-0 bottom-0 flex max-h-[80dvh] flex-col rounded-t-3xl border border-slate-200 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-card">
              <div className="mb-3 flex justify-end">
                <button
                  type="button"
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-300"
                  onClick={() => setThreadsOpen(false)}
                  aria-label="Close conversations"
                >
                  <X size={16} />
                </button>
              </div>
              {conversationList}
            </div>
          </div>
        ) : null}

        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-card">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-white/10">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                <Bot size={20} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold text-slate-950 dark:text-white">
                  Process coach
                </h1>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                  Juvo reads your journals. It will not give trade signals.
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="h-10 px-3 xl:hidden"
              onClick={() => setThreadsOpen(true)}
            >
              <MessageSquare size={16} />
              Chats
            </Button>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden">
            <div
              ref={scrollerRef}
              onScroll={handleScroll}
              className="absolute inset-0 space-y-4 overflow-y-auto overscroll-contain scroll-smooth p-4 [scrollbar-width:thin]"
            >
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
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
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

            {showJump ? (
              <button
                type="button"
                onClick={() => scrollToLatest(true)}
                className="absolute bottom-4 left-1/2 z-10 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg shadow-slate-950/10 transition hover:bg-slate-50 dark:border-white/10 dark:bg-card dark:text-white dark:hover:bg-white/10"
                aria-label="Jump to latest message"
              >
                <ChevronDown size={20} />
              </button>
            ) : null}
          </div>

          <form
            className="shrink-0 border-t border-slate-200 p-3 dark:border-white/10 sm:p-4"
            onSubmit={handleSubmit}
          >
            <div className="flex items-end gap-3">
              <textarea
                className={`${controlClassName} max-h-28 min-h-[52px] resize-none py-3`}
                rows={2}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                placeholder="Ask about your process, not the next setup"
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-12 px-4"
              >
                <Send size={16} />
              </Button>
            </div>
          </form>
        </section>
      </div>
    </DashboardShell>
  );
}
