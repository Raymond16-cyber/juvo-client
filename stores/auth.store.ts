import { create } from "zustand";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  requestResetPassword,
  verifyOtpCode,
  resetPassword,
} from "@/services/auth.service";

import type {
  User,
  RegisterData,
  LoginData,
  VerifyOtpData,
  VerifyOtpResponse,
} from "@/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  resetPasswordToken: string | null;

  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<void>;
  requestResetPassword: (data: { email: string }) => Promise<void>;
  verifyOtpCode: (data: VerifyOtpData) => Promise<VerifyOtpResponse>;
  resetPassword: (data: { email: string; passwords: string }) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  message: null,
  resetPasswordToken: null,

  register: async (data) => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const response = await registerUser(data);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        message: response.message,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Registration failed.",
      });

      throw error;
    }
  },

  login: async (data) => {
    try {
      set({
        isLoading: true,
        error: null,
      });

      const response = await loginUser(data);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Login failed.",
      });

      throw error;
    }
  },
  requestResetPassword: async (data: { email: string }) => {
    try {
      set({
        isLoading: true,
        error: null,
        message: null,
      });
      const result = await requestResetPassword(data);

      set({
        isLoading: false,
        message: "Password reset link sent. Please check your email.",
        resetPasswordToken: result.passwordToken,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error:
          error.response?.data?.message || "Failed to request password reset.",
        message: null,
      });

      throw error;
    }
  },
  verifyOtpCode: async (data) => {
    try {
      set({
        isLoading: true,
        error: null,
        message: null,
        resetPasswordToken: null,
      });

      const result = await verifyOtpCode(data);

      set({
        isLoading: false,
        message: result.message,
        error: null,
        resetPasswordToken: result.resetPasswordToken || null,
      });

      return result;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to verify OTP code.";

      set({
        isLoading: false,
        error: errorMessage,
        message: null,
      });

      throw error;
    }
  },

  resetPassword: async (data) => {
    try {
      set({
        isLoading: true,
        error: null,
        message: null,
      });

      const result = await resetPassword(data);

      set({
        isLoading: false,
        message: result.message || "Password reset successful.",
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Failed to reset password.",
        message: null,
      });

      throw error;
    }
  },
  fetchCurrentUser: async () => {
    try {
      set({
        isLoading: true,
      });

      const user = await getCurrentUser();

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    try {
      await logoutUser();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
      });
    }
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));
