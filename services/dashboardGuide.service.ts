
import api from "@/lib/axios";

export interface DashboardGuideState {
  version: number;
  dismissedHints: string[];
  completedChecklist: string[];
  tourCompleted: boolean;
  completedAt: string | null;
  updatedAt: string | null;
}

export type UpdateDashboardGuidePayload = Partial<
  Pick<
    DashboardGuideState,
    "dismissedHints" | "completedChecklist" | "tourCompleted"
  >
>;

interface DashboardGuideResponse {
  dashboardGuide: DashboardGuideState;
}

interface UpdateDashboardGuideResponse
  extends DashboardGuideResponse {
  message: string;
}

export const getDashboardGuide = async (): Promise<DashboardGuideState> => {
  const response = await api.get<DashboardGuideResponse>(
    "/onboarding/dashboard-guide",
  );

  return response.data.dashboardGuide;
};

export const updateDashboardGuide = async (
  data: UpdateDashboardGuidePayload,
): Promise<DashboardGuideState> => {
  const response = await api.patch<UpdateDashboardGuideResponse>(
    "/onboarding/dashboard-guide",
    data,
  );

  return response.data.dashboardGuide;
};
