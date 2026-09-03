import axios from "axios";

const api = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  baseURL: "https://juvo-server.onrender.com/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const requestUrl = String(error.config?.url || "");
      const isAuthProbe =
        /\/auth\/(sign-in|sign-up|me|request-reset-password|verify-reset-password-code|reset-password)/.test(
          requestUrl,
        );
      const onAuthPage = window.location.pathname.startsWith("/auth");

      if (!isAuthProbe && !onAuthPage) {
        localStorage.removeItem("token");
        const next = window.location.pathname.startsWith("/home")
          ? `?next=${encodeURIComponent(window.location.pathname)}`
          : "";
        window.location.assign(`/auth/login${next}`);
      }
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: unknown } }).response?.data;

    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (typeof data === "object" && data !== null) {
      const payload = data as { message?: unknown; error?: unknown };
      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message;
      }
      if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

export default api;
