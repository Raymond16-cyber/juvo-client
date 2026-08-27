import {
  createJournalService,
  createJournalTradeService,
  getTodayJournalStatusService,
  getUserJournalsService,
} from "@/services/journal.service";
import {
  CreateJournalPayload,
  CreateTradePayload,
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
  journalStatus: JournalStatusData | null;
  message: string | null;

  createJournal: (data: CreateJournalPayload) => Promise<JournalStatusResponse>;
  createTrade: (journalId: string, data: CreateTradePayload) => Promise<TradeSummary>;
  getTodayJournalStatus: () => Promise<JournalStatusResponse>;
  getUserJournals: () => Promise<UserJournalsResponse>;
  clearError: () => void;
}

export const useJournalStore = create<JournalStore>((set) => ({
  isLoading: false,
  error: null,
  journals: [],
  journalStatus: null,
  message: null,

  createJournal: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createJournalService(data);
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
        message: response.message,
      }));
      return response;
    } catch (error) {
      void error;
      set({ error: "Failed to create journal" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  createTrade: async (journalId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createJournalTradeService(journalId, data);
      set((state) => ({
        message: response.message,
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
      return response.data;
    } catch (error) {
      void error;
      set({ error: "Failed to create trade" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  getTodayJournalStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getTodayJournalStatusService();
      set({ journalStatus: response.data, message: response.message });
      return response;
    } catch (error) {
      void error;
      set({ error: "Failed to get today's journal status" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  getUserJournals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getUserJournalsService();
      set({ journals: response.data, message: response.message });
      return response;
    } catch (error) {
      void error;
      set({ error: "Failed to get journals" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  clearError: () => {
    set({ error: null });
  },
}));
