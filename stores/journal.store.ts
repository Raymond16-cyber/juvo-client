import { getTodayJournalStatusService } from "@/services/journal.service";
import { JournalStatusData, JournalStatusResponse } from "@/types/journal.types";
import { create } from "zustand/react";

interface JournalStore {
  isLoading: boolean;
  error: string | null;
  journalStatus: JournalStatusData | null;
  message: string | null;

  createJournal: (data: unknown) => Promise<void>;
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
      void data;
    } catch (error) {
      void error;
      set({ error: "Failed to create journal" });
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
