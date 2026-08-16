import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      // User is not authenticated
      // You could redirect to login here
    }

    return Promise.reject(error);
  },
);

export default api;
