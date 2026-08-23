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

export interface LoginResponse {
  user: User;
  success: boolean;
  message: string | null;
  error: string | null,
  isAuthenticated: boolean
  token: string

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
