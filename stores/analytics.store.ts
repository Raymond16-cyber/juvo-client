import { getAnalyticsService } from "@/services/analytics.service";
import { AnalyticsData } from "@/types/analytics.types";
import { create } from "zustand";

interface AnalyticsStore {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: () => Promise<AnalyticsData>;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAnalyticsService();
      set({ data: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      void error;
      set({ error: "Unable to load analytics.", isLoading: false });
      throw error;
    }
  },
}));
