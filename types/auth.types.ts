export interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  authProvider: "local" | "google" | "apple";
  experienceLevel: "beginner" | "intermediate" | "Advanced";
  tradingStyle: "scalper" | "dayTrader" | "swingTrader" | "positionTrader" | "";
  country: string;
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
  success: boolean;
  message: string;
  user: User;
}

export interface RequestResetPasswordData {
  email: string;
}