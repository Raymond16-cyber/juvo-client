import { create } from "zustand";
import { AxiosError } from "axios";

import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  requestResetPassword,
  verifyOtpCode,
  resetPassword,
  updatePreferences,
} from "@/services/auth.service";

import type {
  User,
  RegisterData,
  LoginData,
  VerifyOtpData,
  VerifyOtpResponse,
  ResetPasswordData,
  LoginResponse,
  UpdatePreferencesPayload,
} from "@/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  message: string | null;
  token: string | null;
  resetPasswordToken: string | null;

  register: (data: RegisterData) => Promise<void>;
  login: (data: LoginData) => Promise<LoginResponse>;
  requestResetPassword: (data: { email: string }) => Promise<void>;
  verifyOtpCode: (data: VerifyOtpData) => Promise<VerifyOtpResponse>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (data: UpdatePreferencesPayload) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  message: null,
  token: null,
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
        token: response.token,
        message: response.message,
        error: null,
      });

      localStorage.setItem("token", response.token);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;

      set({
        isLoading: false,
        error: axiosError.response?.data?.message || "Registration failed.",
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
      localStorage.setItem("token", response.token);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        token: response.token,
      });

      return response;
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;

      set({
        isLoading: false,
        error: axiosError.response?.data?.message || "Login failed.",
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
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;

      set({
        isLoading: false,
        error:
          axiosError.response?.data?.message ||
          "Failed to request password reset.",
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
    } catch (error) {
      const axiosError = error as AxiosError<{
        error?: string;
        message?: string;
      }>;
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.response?.data?.message ||
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
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;

      set({
        isLoading: false,
        error:
          axiosError.response?.data?.message || "Failed to reset password.",
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
      localStorage.removeItem("token");

      set({
        user: null,
        isAuthenticated: false,
        token: null,
      });
    }
  },

  updatePreferences: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await updatePreferences(data);
      set({
        user: response.user,
        isLoading: false,
        message: response.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      set({
        isLoading: false,
        error: axiosError.response?.data?.message || "Failed to update settings.",
      });
      throw error;
    }
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));
