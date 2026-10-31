import { create } from "zustand";

import { getApiErrorMessage } from "@/lib/axios";
import {
  loginUser,
  registerUser,
  getCurrentUser,
  logoutUser,
  requestResetPassword,
  verifyOtpCode,
  verifyEmail,
  resetPassword,
  updatePreferences,
} from "@/services/auth.service";

import type {
  User,
  RegisterData,
  LoginData,
  VerifyOtpData,
  VerifyOtpResponse,
  verifyEmailResponse,
  ResetPasswordData,
  LoginResponse,
  AuthResponse,
  UpdatePreferencesPayload,
} from "@/types/auth.types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCheckedAuth: boolean;
  error: string | null;
  message: string | null;
  token: string | null;
  resetPasswordToken: string | null;
  verificationSent: boolean | null;

  register: (data: RegisterData) => Promise<AuthResponse>;
  login: (data: LoginData) => Promise<LoginResponse>;
  requestResetPassword: (data: { email: string }) => Promise<void>;
  verifyOtpCode: (data: VerifyOtpData) => Promise<VerifyOtpResponse>;
  verifyEmail: (token: string) => Promise<verifyEmailResponse>;
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
  hasCheckedAuth: false,
  error: null,
  message: null,
  token: null,
  resetPasswordToken: null,
  verificationSent: null,

  register: async (data) => {
    set({
      isLoading: true,
      error: null,
      message: null,
      verificationSent: null,
    });

    try {
      const response = await registerUser(data);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        hasCheckedAuth: true,
        token: response.token,
        message: response.message,
        error: null,
        verificationSent:
          typeof response.verificationSent === "boolean"
            ? response.verificationSent
            : true,
      });

      localStorage.setItem("token", response.token);
      return response;
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, "Registration failed.");
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  login: async (data) => {
    set({
      isLoading: true,
      error: null,
      message: null,
    });

    try {
      const response = await loginUser(data);
      localStorage.setItem("token", response.token);

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        hasCheckedAuth: true,
        token: response.token,
        error: null,
      });

      return response;
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        "Invalid email or password.",
      );
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
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
        message:
          result.message ||
          "If an account exists for that email, a verification code has been sent.",
        resetPasswordToken: result.passwordToken,
      });
    } catch (error) {
      set({
        isLoading: false,
        error: getApiErrorMessage(error, "Failed to request password reset."),
        message: null,
      });

      throw new Error(
        getApiErrorMessage(error, "Failed to request password reset."),
      );
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
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to verify OTP code.",
      );

      set({
        isLoading: false,
        error: errorMessage,
        message: null,
      });

      throw new Error(errorMessage);
    }
  },

  verifyEmail: async (token) => {
    try {
      set({
        isLoading: true,
        error: null,
        message: null,
      });
      const result = await verifyEmail(token);

      set({
        isLoading: false,
        message: result.message,
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, "Failed to verify email.");

      set({
        isLoading: false,
        error: errorMessage,
        message: null,
      });

      throw new Error(errorMessage);
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
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to reset password.",
      );

      set({
        isLoading: false,
        error: errorMessage,
        message: null,
      });

      throw new Error(errorMessage);
    }
  },
  fetchCurrentUser: async () => {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          hasCheckedAuth: true,
          token: null,
        });
        return;
      }

      set({
        isLoading: true,
        token,
      });

      const user = await getCurrentUser();

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        hasCheckedAuth: true,
        token,
      });
    } catch {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        hasCheckedAuth: true,
        token: null,
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
        hasCheckedAuth: true,
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
      const errorMessage = getApiErrorMessage(
        error,
        "Failed to update settings.",
      );
      set({
        isLoading: false,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));
