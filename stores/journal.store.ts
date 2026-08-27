import {
  createJournalService,
  createJournalTradeService,
  getTodayJournalStatusService,
} from "@/services/journal.service";
import {
  CreateJournalPayload,
  CreateTradePayload,
  JournalStatusData,
  JournalStatusResponse,
  TradeSummary,
} from "@/types/journal.types";
import { create } from "zustand/react";

interface JournalStore {
  isLoading: boolean;
  error: string | null;
  journalStatus: JournalStatusData | null;
  message: string | null;

  createJournal: (data: CreateJournalPayload) => Promise<JournalStatusResponse>;
  createTrade: (journalId: string, data: CreateTradePayload) => Promise<TradeSummary>;
  getTodayJournalStatus: () => Promise<JournalStatusResponse>;
  clearError: () => void;
}

export const useJournalStore = create<JournalStore>((set) => ({
  isLoading: false,
  error: null,
  journalStatus: null,
  message: null,

  createJournal: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createJournalService(data);
      set({ journalStatus: response.data, message: response.message });
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
  clearError: () => {
    set({ error: null });
  },
}));
