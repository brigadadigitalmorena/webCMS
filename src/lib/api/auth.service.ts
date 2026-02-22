import axios from "axios";
import apiClient from "./client";
import { normalizeUser } from "./user.service";
import { User } from "@/types";

interface LoginCredentials {
  email: string;
  password: string;
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
    const response = await axios.post<{ user: User }>(
      "/api/auth/login",
      credentials,
    );
    return response.data.user;
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
