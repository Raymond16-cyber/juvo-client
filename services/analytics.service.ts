import api from "@/lib/axios";
import { AnalyticsData } from "@/types/analytics.types";

export const getAnalyticsService = async () => {
  const response = await api.get<{ data: AnalyticsData }>("/analytics");
  return response.data;
};
