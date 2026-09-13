import { getAnalyticsService } from "@/services/analytics.service";
import { AnalyticsData } from "@/types/analytics.types";
import { create } from "zustand";

interface AnalyticsStore {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  fetchAnalytics: (tradingAccountId?: string | null) => Promise<AnalyticsData>;
  refreshAnalytics: () => Promise<AnalyticsData | null>;
}

let latestRequest = 0;
let requestedAccountId: string | null | undefined;

export const useAnalyticsStore = create<AnalyticsStore>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  fetchAnalytics: async (tradingAccountId) => {
    const requestId = ++latestRequest;
    requestedAccountId = tradingAccountId ?? null;
    set({ isLoading: true, error: null });
    try {
      const response = await getAnalyticsService(tradingAccountId);
      if (requestId === latestRequest) set({ data: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      void error;
      if (requestId === latestRequest) set({ error: "Unable to load analytics.", isLoading: false });
      throw error;
    }
  },
  refreshAnalytics: () => requestedAccountId === undefined
    ? Promise.resolve(null)
    : get().fetchAnalytics(requestedAccountId),
}));
