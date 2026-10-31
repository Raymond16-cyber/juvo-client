import { create } from "zustand";

import { getApiErrorMessage } from "@/lib/axios";
import { createEphemeralFeedback } from "@/lib/ephemeral-feedback";
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
  updatePreferences: (
    data: UpdatePreferencesPayload,
    options?: { silent?: boolean },
  ) => Promise<void>;
  clearError: () => void;
  clearFeedback: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const feedback = createEphemeralFeedback(() =>
    set({ message: null, error: null }),
  );

  const showFeedback = (patch: {
    message?: string | null;
    error?: string | null;
  } & Record<string, unknown>) => {
    set(patch as Partial<AuthState>);
    if (patch.message || patch.error) {
      feedback.schedule();
    } else {
      feedback.cancel();
    }
  };

  return {
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
      feedback.cancel();

      try {
        const response = await registerUser(data);

        showFeedback({
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
        showFeedback({
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
      feedback.cancel();

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
        showFeedback({
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
        feedback.cancel();
        const result = await requestResetPassword(data);

        showFeedback({
          isLoading: false,
          message:
            result.message ||
            "If an account exists for that email, a verification code has been sent.",
          resetPasswordToken: result.passwordToken,
        });
      } catch (error) {
        showFeedback({
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
        feedback.cancel();

        const result = await verifyOtpCode(data);

        showFeedback({
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

        showFeedback({
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
        feedback.cancel();
        const result = await verifyEmail(token);

        showFeedback({
          isLoading: false,
          message: result.message,
          error: null,
        });

        return result;
      } catch (error) {
        const errorMessage = getApiErrorMessage(error, "Failed to verify email.");

        showFeedback({
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
        feedback.cancel();

        const result = await resetPassword(data);

        showFeedback({
          isLoading: false,
          message: result.message || "Password reset successful.",
          error: null,
        });
      } catch (error) {
        const errorMessage = getApiErrorMessage(
          error,
          "Failed to reset password.",
        );

        showFeedback({
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
        feedback.clearNow();

        set({
          user: null,
          isAuthenticated: false,
          token: null,
          hasCheckedAuth: true,
          message: null,
          error: null,
        });
      }
    },

    updatePreferences: async (data, options) => {
      try {
        set({ isLoading: true, error: null });
        if (!options?.silent) feedback.cancel();
        const response = await updatePreferences(data);
        if (options?.silent) {
          set({
            user: response.user,
            isLoading: false,
          });
        } else {
          showFeedback({
            user: response.user,
            isLoading: false,
            message: response.message,
          });
        }
      } catch (error) {
        const errorMessage = getApiErrorMessage(
          error,
          "Failed to update settings.",
        );
        if (options?.silent) {
          set({
            isLoading: false,
          });
        } else {
          showFeedback({
            isLoading: false,
            error: errorMessage,
          });
        }
        throw new Error(errorMessage);
      }
    },

    clearError: () => {
      set({
        error: null,
      });
    },

    clearFeedback: () => {
      feedback.clearNow();
    },
  };
});
