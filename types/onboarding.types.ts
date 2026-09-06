export interface OnboardingData {
  country: string;
  timezone: string;
  experienceLevel: string;
  tradingStyle: string;
  instruments: string[];
  biggestChallenges: string[];
  theme: string;
  preferredCurrency: string;
  weekStartsOn: string;
  notificationsEnabled: boolean;
  reminderTime: string;
  pushToken: string;
  currentStep: number;
}

export interface OnboardingResponse {
  message: string;
  user: unknown;
}
