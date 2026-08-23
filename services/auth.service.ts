import api from "@/lib/axios";
import {
  User,
  AuthResponse,
  RegisterData,
  LoginData,
  VerifyOtpData,
  ResetPasswordData,
  LoginResponse,
} from "@/types/auth.types";

export const registerUser = async (
  data: RegisterData,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/sign-up", data);

  return response.data;
};

export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/sign-in", data);
  return response.data;
};

export const requestResetPassword = async (data: { email: string }) => {
  const response = await api.post("/auth/request-reset-password", data);
  return response.data;
};

export const verifyOtpCode = async (data: VerifyOtpData) => {
  const response = await api.post(
    `/auth/verify-reset-password-code/${data.token}`,
    {
      otp: data.otp,
      email: data.email,
    },
  );

  return response.data;
};

export const resetPassword = async (data: ResetPasswordData) => {
  const response = await api.post(`/auth/reset-password/${data.token}`, data);

  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<{ user: User }>("/auth/me");

  return response.data.user;
};

export const logoutUser = async () => {
  const response = await api.post("/auth/logout");

  return response.data;
};
