import { showAchievementUnlocks } from "@/lib/achievements";
import { getApiErrorMessage } from "@/lib/axios";
import { createEphemeralFeedback } from "@/lib/ephemeral-feedback";
import {
  closeJournalTradeService,
  completeJournalService,
  createJournalService,
  createJournalTradeService,
  getJournalByIdService,
  getTodayJournalStatusService,
  getUserJournalsService,
} from "@/services/journal.service";
import { useAccountsStore } from "@/stores/accounts.store";
import { showAccountOutcomeNotice } from "@/stores/notice.store";
import {
  CloseTradePayload,
  CloseTradeResponse,
  CompleteJournalPayload,
  CreateJournalPayload,
  CreateTradePayload,
  JournalDetail,
  JournalHistoryItem,
  JournalStatusData,
  JournalStatusResponse,
  TradeSummary,
  UserJournalsResponse,
} from "@/types/journal.types";
import { create } from "zustand/react";

interface JournalStore {
  isLoading: boolean;
  error: string | null;
  journals: JournalHistoryItem[];
  currentJournal: JournalDetail | null;
  journalStatus: JournalStatusData | null;
  message: string | null;

  createJournal: (data: CreateJournalPayload) => Promise<JournalStatusResponse>;
  createTrade: (journalId: string, data: CreateTradePayload) => Promise<TradeSummary>;
  closeTrade: (
    journalId: string,
    tradeId: string,
    data: CloseTradePayload,
  ) => Promise<CloseTradeResponse>;
  completeJournal: (
    journalId: string,
    data: CompleteJournalPayload,
  ) => Promise<JournalDetail>;
  getJournalById: (journalId: string) => Promise<JournalDetail>;
  getTodayJournalStatus: () => Promise<JournalStatusResponse>;
  getUserJournals: () => Promise<UserJournalsResponse>;
  clearError: () => void;
  clearFeedback: () => void;
}

export const useJournalStore = create<JournalStore>((set) => {
  const feedback = createEphemeralFeedback(() =>
    set({ message: null, error: null }),
  );

  const showFeedback = (patch: Record<string, unknown>) => {
    set(patch as Partial<JournalStore>);
    if (patch.message || patch.error) {
      feedback.schedule();
    }
  };

  return {
    isLoading: false,
    error: null,
    journals: [],
    currentJournal: null,
    journalStatus: null,
    message: null,

    createJournal: async (data) => {
      set({ isLoading: true, error: null });
      feedback.cancel();
      try {
        const response = await createJournalService(data);
        showAchievementUnlocks(response.newlyEarned);
        set((state) => ({
          journalStatus: response.data,
          journals: response.data.journal
            ? [
                {
                  ...response.data.journal,
                  totalProfitLoss: 0,
                  openTrades: 0,
                  closedTrades: 0,
                  winningTrades: 0,
                  losingTrades: 0,
                  trades: [],
                },
                ...state.journals.filter(
                  (journal) => journal._id !== response.data.journal?._id,
                ),
              ]
            : state.journals,
        }));
        showFeedback({ message: response.message });
        return response;
      } catch (error) {
        void error;
        showFeedback({ error: "Failed to create journal" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    createTrade: async (journalId, data) => {
      set({ isLoading: true, error: null });
      feedback.cancel();
      try {
        const response = await createJournalTradeService(journalId, data);
        showAchievementUnlocks(response.newlyEarned);
        set((state) => ({
          journalStatus: state.journalStatus?.journal
            ? {
                ...state.journalStatus,
                journal: {
                  ...state.journalStatus.journal,
                  tradesCount: (state.journalStatus.journal.tradesCount || 0) + 1,
                },
              }
            : state.journalStatus,
        }));
        showFeedback({ message: response.message });
        return response.data;
      } catch (error) {
        const message = getApiErrorMessage(error, "Failed to create trade");
        showFeedback({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    closeTrade: async (journalId, tradeId, data) => {
      set({ isLoading: true, error: null });
      feedback.cancel();
      try {
        const response = await closeJournalTradeService(journalId, tradeId, data);
        if (
          response.tradingAccount?.statusChanged &&
          (response.tradingAccount.status === "Passed" ||
            response.tradingAccount.status === "Breached")
        ) {
          showAccountOutcomeNotice({
            _id: response.tradingAccount._id,
            accountName: response.tradingAccount.accountName,
            status: response.tradingAccount.status,
          });
        }
        useAccountsStore.getState().fetchAccounts().catch(() => undefined);
        showFeedback({ message: response.message });
        return response;
      } catch (error) {
        void error;
        showFeedback({ error: "Failed to close trade" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    completeJournal: async (journalId, data) => {
      set({ isLoading: true, error: null });
      feedback.cancel();
      try {
        const response = await completeJournalService(journalId, data);
        showAchievementUnlocks(response.newlyEarned);
        set((state) => ({
          currentJournal: response.data,
          journals: state.journals.map((journal) =>
            journal._id === journalId ? { ...journal, ...response.data } : journal,
          ),
        }));
        showFeedback({ message: response.message });
        return response.data;
      } catch (error) {
        void error;
        showFeedback({ error: "Failed to complete journal" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    getJournalById: async (journalId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await getJournalByIdService(journalId);
        set({ currentJournal: response.data });
        return response.data;
      } catch (error) {
        void error;
        showFeedback({ error: "Failed to load journal" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    getTodayJournalStatus: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await getTodayJournalStatusService();
        set({ journalStatus: response.data });
        return response;
      } catch (error) {
        void error;
        showFeedback({ error: "Failed to get today's journal status" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    getUserJournals: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await getUserJournalsService();
        set({ journals: response.data });
        return response;
      } catch (error) {
        void error;
        showFeedback({ error: "Failed to get journals" });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    clearError: () => {
      set({ error: null });
    },
    clearFeedback: () => {
      feedback.clearNow();
    },
  };
});
