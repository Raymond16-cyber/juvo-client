export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  authProvider: "local" | "google" | "apple";
  profile?: {
    country?: string;
    timezone?: string;
    experienceLevel?: "beginner" | "intermediate" | "advanced" | "professional";
    tradingStyle?:
      | "scalping"
      | "day_trading"
      | "swing_trading"
      | "position_trading";
    instruments?: string[];
    biggestChallenges?: string[];
  };
  preferences?: {
    theme?: "light" | "dark" | "system";
    preferredCurrency?: string;
    weekStartsOn?: "sunday" | "monday";
    notifications?: {
      enabled?: boolean;
      reminderTime?: string;
      pushToken?: string | null;
    };
  };
  subscription?: {
    plan?: "free" | "pro" | "super";
    status?: "trial" | "active" | "expired" | "cancelled";
    startedAt?: string;
    expiresAt?: string;
    trialEndsAt?: string;
  };
  stats?: {
    currentJournalStreak?: number;
    longestJournalStreak?: number;
    totalTrades?: number;
    totalJournals?: number;
  };
  onboarding?: {
    completed?: boolean;
    currentStep?: number;
    completedAt?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginResponse {
  user: User;
  message: string;
  token: string;
}

export interface RequestResetPasswordData {
  email: string;
}

export interface VerifyOtpData {
  token: string;
  otp: string;
  email: string | null;
}

export interface VerifyOtpResponse {
  message: string;
  isValid: boolean;
  resetPasswordToken: string | null;
}

export interface ResetPasswordData {
  token: string | null;
  email: string;
  passwords: string;
}

export interface UpdatePreferencesPayload {
  theme?: "light" | "dark" | "system";
  preferredCurrency?: string;
  weekStartsOn?: "sunday" | "monday";
  notificationsEnabled?: boolean;
  reminderTime?: string;
  fullName?: string;
  country?: string;
  timezone?: string;
}
