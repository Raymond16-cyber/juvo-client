import api from "@/lib/axios";

import type {
  OnboardingData,
  OnboardingResponse,
} from "@/types/onboarding.types";

export const saveOnboarding = async (
  data: OnboardingData,
): Promise<OnboardingResponse> => {
  const response = await api.post<OnboardingResponse>("/onboarding/onboard-user", data);

  return response.data;
};
