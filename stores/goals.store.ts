import {
  createGoalService,
  deleteGoalService,
  listGoalsService,
  updateGoalService,
} from "@/services/goal.service";
import { CreateGoalPayload, Goal } from "@/types/goal.types";
import { create } from "zustand";

interface GoalsStore {
  goals: Goal[];
  isLoading: boolean;
  error: string | null;
  fetchGoals: () => Promise<Goal[]>;
  createGoal: (data: CreateGoalPayload) => Promise<Goal>;
  updateGoal: (
    goalId: string,
    data: Partial<CreateGoalPayload> & { status?: Goal["status"]; currentValue?: number },
  ) => Promise<Goal>;
  deleteGoal: (goalId: string) => Promise<void>;
}

export const useGoalsStore = create<GoalsStore>((set) => ({
  goals: [],
  isLoading: false,
  error: null,
  fetchGoals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await listGoalsService();
      set({ goals: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      void error;
      set({ error: "Unable to load goals.", isLoading: false });
      throw error;
    }
  },
  createGoal: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await createGoalService(data);
      set((state) => ({ goals: [response.data, ...state.goals], isLoading: false }));
      return response.data;
    } catch (error) {
      void error;
      set({ error: "Unable to create goal.", isLoading: false });
      throw error;
    }
  },
  updateGoal: async (goalId, data) => {
    const response = await updateGoalService(goalId, data);
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal._id === goalId ? response.data : goal,
      ),
    }));
    return response.data;
  },
  deleteGoal: async (goalId) => {
    await deleteGoalService(goalId);
    set((state) => ({
      goals: state.goals.filter((goal) => goal._id !== goalId),
    }));
  },
}));
