import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/auth-store";

/**
 * Axios client that routes ALL requests through the Next.js API proxy
 * at /api/backend/*. The proxy reads the access_token from an HttpOnly
 * cookie and injects the Authorization header server-side, so JWT
 * tokens never appear in client-side JavaScript.
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: "/api/backend",
  timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// No request interceptor needed — the proxy handles auth

// Response interceptor — handle 401 via server-side refresh
let isRefreshing = false;
let isSessionDead = false; // Prevents ALL further requests after session loss
let pendingQueue: Array<{
  resolve: (v: unknown) => void;
  reject: (e: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

function processPendingQueue(success: boolean) {
  pendingQueue.forEach(({ resolve, reject, config }) => {
    if (success) {
      resolve(apiClient(config));
    } else {
      reject(new Error("Session expired"));
    }
  });
  pendingQueue = [];
}

function forceRedirectToLogin() {
  if (isSessionDead) return; // Already redirecting
  isSessionDead = true;
  useAuthStore.getState().logout();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/** Call after a successful login to allow requests again. */
export function resetApiSession() {
  isSessionDead = false;
  isRefreshing = false;
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // If session is already dead, reject immediately — no retries, no refresh
    if (isSessionDead) {
      return Promise.reject(new Error("Session expired"));
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If another request already triggered a refresh, queue this one
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      isRefreshing = true;

      try {
        const res = await axios.post("/api/auth/refresh");

        if (res.status === 200) {
          isRefreshing = false;
          processPendingQueue(true);
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed — session is dead
      }

      isRefreshing = false;
      processPendingQueue(false);
      forceRedirectToLogin();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
