import api from "@/lib/axios";
import { CreateGoalPayload, Goal } from "@/types/goal.types";

export const listGoalsService = async () => {
  const response = await api.get<{ data: Goal[] }>("/goals");
  return response.data;
};

export const createGoalService = async (data: CreateGoalPayload) => {
  const response = await api.post<{ data: Goal }>("/goals", { data });
  return response.data;
};

export const updateGoalService = async (
  goalId: string,
  data: Partial<CreateGoalPayload> & { status?: Goal["status"]; currentValue?: number },
) => {
  const response = await api.patch<{ data: Goal }>(`/goals/${goalId}`, { data });
  return response.data;
};

export const deleteGoalService = async (goalId: string) => {
  const response = await api.delete<{ data: { _id: string } }>(`/goals/${goalId}`);
  return response.data;
};
