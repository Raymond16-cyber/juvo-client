import api from "@/lib/axios";
import { AnalyticsData } from "@/types/analytics.types";

export const getAnalyticsService = async (tradingAccountId?: string | null) => {
  const response = await api.get<{ data: AnalyticsData }>("/analytics", {
    params: tradingAccountId ? { tradingAccount: tradingAccountId } : undefined,
  });
  return response.data;
};
