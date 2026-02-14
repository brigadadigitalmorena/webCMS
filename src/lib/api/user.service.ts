import apiClient from "./client";
import { User, PaginatedResponse } from "@/types";

interface CreateUserData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: "admin" | "encargado" | "brigadista";
  telefono?: string;
}

interface UpdateUserData {
  email?: string;
  nombre?: string;
  apellido?: string;
  rol?: "admin" | "encargado" | "brigadista";
  telefono?: string;
  activo?: boolean;
}

interface GetUsersParams {
  page?: number;
  size?: number;
  rol?: string;
  activo?: boolean;
  search?: string;
}

export const userService = {
  /**
   * Get paginated list of users
   */
  async getUsers(params?: GetUsersParams): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>("/users", {
      params,
    });
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getUser(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiClient.post<User>("/users", data);
    return response.data;
  },

  /**
   * Update existing user
   */
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Activate/deactivate user
   */
  async toggleUserStatus(id: number, activo: boolean): Promise<User> {
    const response = await apiClient.patch<User>(`/users/${id}/status`, {
      activo,
    });
    return response.data;
  },

  /**
   * Reset user password
   */
  async resetPassword(id: number, newPassword: string): Promise<void> {
    await apiClient.post(`/users/${id}/reset-password`, {
      new_password: newPassword,
    });
  },
};
