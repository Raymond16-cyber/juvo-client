import api from "@/lib/axios";
import {
  AchievementsResponse,
  CelebrateAchievementsResponse,
  FeaturedAchievementsResponse,
} from "@/types/achievement.types";

export const getAchievementsService = async (): Promise<AchievementsResponse> => {
  const response = await api.get<AchievementsResponse>("/achievements");
  return response.data;
};

export const celebrateAchievementsService = async (
  achievementIds: string[],
): Promise<CelebrateAchievementsResponse> => {
  const response = await api.post<CelebrateAchievementsResponse>(
    "/achievements/celebrate",
    { achievementIds },
  );
  return response.data;
};

export const setFeaturedAchievementsService = async (
  achievementIds: string[],
): Promise<FeaturedAchievementsResponse> => {
  const response = await api.put<FeaturedAchievementsResponse>(
    "/achievements/featured",
    { achievementIds },
  );
  return response.data;
};
