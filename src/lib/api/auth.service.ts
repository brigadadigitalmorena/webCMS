import apiClient from "./client";
import { AuthUser } from "@/types";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
    telefono?: string;
    created_at: string;
    activo: boolean;
  };
}

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const formData = new FormData();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return {
      ...response.data.user,
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };
  },

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    await apiClient.post("/auth/logout");
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<{ access_token: string }> {
    const response = await apiClient.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  async me(): Promise<AuthUser> {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};
