import { create } from "zustand";
import { AxiosError } from "axios";

import type { OnboardingData } from "@/types/onboarding.types";
import { saveOnboarding } from "@/services/onboarding.service";

interface OnboardingState extends OnboardingData {
  isLoading: boolean;
  error: string | null;
  completed: boolean;

  updateField: <K extends keyof OnboardingData>(
    field: K,
    value: OnboardingData[K],
  ) => void;

  updateFields: (data: Partial<OnboardingData>) => void;

  nextStep: () => void;
  previousStep: () => void;

  submitOnboarding: () => Promise<void>;

  reset: () => void;
}

const initialState: OnboardingData = {
  country: "",
  timezone: "",
  experienceLevel: "beginner",
  tradingStyle: "",
  instruments: [],
  biggestChallenges: [],
  theme: "dark",
  preferredCurrency: "USD",
  weekStartsOn: "monday",
  notificationsEnabled: true,
  reminderTime: "09:00",
  pushToken: "",
  currentStep: 0,
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  ...initialState,

  isLoading: false,
  error: null,
  completed: false,

  updateField: (field, value) => {
    set({
      [field]: value,
      error: null,
    } as Partial<OnboardingState>);
  },

  updateFields: (data) => {
    set({
      ...data,
      error: null,
    });
  },

  nextStep: () => {
    set((state) => ({
      currentStep: Math.min(state.currentStep + 1, 6),
    }));
  },

  previousStep: () => {
    set((state) => ({
      currentStep: Math.max(state.currentStep - 1, 0),
    }));
  },

  submitOnboarding: async () => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const state = get();

      await saveOnboarding({
        country: state.country,
        timezone: state.timezone,
        experienceLevel: state.experienceLevel,
        tradingStyle: state.tradingStyle,
        instruments: state.instruments,
        biggestChallenges: state.biggestChallenges,
        theme: state.theme,
        preferredCurrency: state.preferredCurrency,
        weekStartsOn: state.weekStartsOn,
        notificationsEnabled: state.notificationsEnabled,
        reminderTime: state.reminderTime,
        pushToken: state.pushToken,
        currentStep: state.currentStep,
      });

      set({
        isLoading: false,
        completed: true,
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;

      set({
        isLoading: false,
        error:
          axiosError.response?.data?.message || "Failed to save onboarding.",
      });

      throw error;
    }
  },

  reset: () => {
    set({
      ...initialState,
      isLoading: false,
      error: null,
      completed: false,
    });
  },
}));
