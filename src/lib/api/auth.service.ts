import axios from "axios";
import apiClient from "./client";
import { normalizeUser } from "./user.service";
import { User } from "@/types";

interface LoginCredentials {
  email: string;
  password: string;
}

function getAuthErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    const message = error.response?.data?.message;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object" && "msg" in item) {
            const msg = item.msg;
            return typeof msg === "string" ? msg : JSON.stringify(item);
          }

          return JSON.stringify(item);
        })
        .join(". ");
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Error al iniciar sesión";
}

/**
 * Auth service.
 *
 * Login and logout go through Next.js API proxy routes that set/clear
 * HttpOnly cookies. All other calls go through the generic proxy in
 * apiClient (which reads the cookie server-side).
 */
export const authService = {
  /**
   * Login via server-side proxy — tokens are set as HttpOnly cookies.
   * Returns ONLY the user profile (no tokens in JS).
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await axios.post<{ user: User }>(
        "/api/auth/login",
        credentials,
      );
      return response.data.user;
    } catch (error) {
      throw new Error(getAuthErrorMessage(error));
    }
  },

  /**
   * Logout via server-side proxy — clears HttpOnly cookies.
   */
  async logout(): Promise<void> {
    await axios.post("/api/auth/logout");
  },

  /**
   * Get current user profile (through the backend proxy).
   * Normalises backend field names (full_name → nombre/apellido, etc.).
   */
  async me(): Promise<User> {
    const response = await apiClient.get("/auth/me");
    return normalizeUser(response.data);
  },
};
