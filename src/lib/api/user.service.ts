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
  avatar_url?: string;
  activo?: boolean;
}

interface GetUsersParams {
  page?: number;
  size?: number;
  rol?: string;
  activo?: boolean;
  search?: string;
}

const splitFullName = (fullName: string | undefined) => {
  const trimmed = (fullName || "").trim();
  if (!trimmed) {
    return { nombre: "", apellido: "" };
  }
  const parts = trimmed.split(" ");
  return {
    nombre: parts[0] || "",
    apellido: parts.slice(1).join(" "),
  };
};

const normalizeUser = (user: any): User => {
  const nameParts = splitFullName(user.full_name || user.nombre);

  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre || nameParts.nombre,
    apellido: user.apellido || nameParts.apellido,
    rol: user.rol || user.role,
    telefono: user.telefono || user.phone,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
    activo: user.activo ?? user.is_active ?? true,
  };
};

const toBackendUserPayload = (data: CreateUserData | UpdateUserData) => {
  const nombre = "nombre" in data ? data.nombre : undefined;
  const apellido = "apellido" in data ? data.apellido : undefined;
  const fullName = [nombre, apellido].filter(Boolean).join(" ").trim();
  const isActive = "activo" in data ? data.activo : undefined;
  const avatarUrl = "avatar_url" in data ? data.avatar_url : undefined;

  return {
    email: data.email,
    full_name: fullName || undefined,
    phone: data.telefono,
    role: data.rol,
    avatar_url: avatarUrl,
    is_active: isActive,
  };
};

export const userService = {
  /**
   * Get paginated list of users
   */
  async getUsers(params?: GetUsersParams): Promise<User[]> {
    const limit = params?.size || 100;
    const page = params?.page || 1;
    const response = await apiClient.get<User[]>("/users", {
      params: {
        skip: (page - 1) * limit,
        limit,
        role: params?.rol,
        is_active: params?.activo,
        search: params?.search,
      },
    });
    return response.data.map(normalizeUser);
  },

  /**
   * Get paginated users with total count from headers
   */
  async getUsersPaginated(
    params?: GetUsersParams,
  ): Promise<{ items: User[]; total: number }> {
    const limit = params?.size || 100;
    const page = params?.page || 1;
    const response = await apiClient.get<User[]>("/users", {
      params: {
        skip: (page - 1) * limit,
        limit,
        role: params?.rol,
        is_active: params?.activo,
        search: params?.search,
      },
    });

    const totalHeader = response.headers["x-total-count"];
    const total = totalHeader ? Number(totalHeader) : response.data.length;

    return {
      items: response.data.map(normalizeUser),
      total: Number.isNaN(total) ? response.data.length : total,
    };
  },

  /**
   * Get user by ID
   */
  async getUser(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return normalizeUser(response.data);
  },

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    const payload = {
      ...toBackendUserPayload(data),
      password: data.password,
    };
    const response = await apiClient.post<User>("/users", payload);
    return normalizeUser(response.data);
  },

  /**
   * Update existing user
   */
  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    const payload = toBackendUserPayload(data);
    const response = await apiClient.patch<User>(`/users/${id}`, payload);
    return normalizeUser(response.data);
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
    const response = await apiClient.patch<User>(`/users/${id}`, {
      is_active: activo,
    });
    return normalizeUser(response.data);
  },

  /**
   * Reset user password
   */
  async resetPassword(
    id: number,
  ): Promise<{ message: string; temporary_password: string }> {
    const response = await apiClient.post<{
      message: string;
      temporary_password: string;
    }>(`/users/${id}/reset-password`);
    return response.data;
  },

  /**
   * Update own profile (PATCH /users/me)
   */
  async updateProfile(data: UpdateUserData): Promise<User> {
    const payload = toBackendUserPayload(data);
    const response = await apiClient.patch<User>("/users/me", payload);
    return normalizeUser(response.data);
  },

  /**
   * Upload own profile photo (POST /users/me/avatar)
   */
  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<User>("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return normalizeUser(response.data);
  },

  /**
   * Change own password (POST /users/me/change-password)
   */
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>(
      "/users/me/change-password",
      { current_password: currentPassword, new_password: newPassword },
    );
    return response.data;
  },
};
