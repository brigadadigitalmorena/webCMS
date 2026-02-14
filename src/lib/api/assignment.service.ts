import apiClient from "./client";
import { Assignment, PaginatedResponse } from "@/types";

interface CreateAssignmentData {
  encuesta_id: number;
  encargado_id: number;
  brigadista_id?: number;
  direccion: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  fecha_limite: string;
}

interface UpdateAssignmentData {
  encargado_id?: number;
  brigadista_id?: number;
  direccion?: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  fecha_limite?: string;
  estado?: string;
}

interface GetAssignmentsParams {
  page?: number;
  size?: number;
  estado?: string;
  encargado_id?: number;
  brigadista_id?: number;
  encuesta_id?: number;
}

export const assignmentService = {
  /**
   * Get paginated list of assignments
   */
  async getAssignments(
    params?: GetAssignmentsParams,
  ): Promise<PaginatedResponse<Assignment>> {
    const response = await apiClient.get<PaginatedResponse<Assignment>>(
      "/assignments",
      { params },
    );
    return response.data;
  },

  /**
   * Get assignment by ID
   */
  async getAssignment(id: number): Promise<Assignment> {
    const response = await apiClient.get<Assignment>(`/assignments/${id}`);
    return response.data;
  },

  /**
   * Create new assignment
   */
  async createAssignment(data: CreateAssignmentData): Promise<Assignment> {
    const response = await apiClient.post<Assignment>("/assignments", data);
    return response.data;
  },

  /**
   * Update existing assignment
   */
  async updateAssignment(
    id: number,
    data: UpdateAssignmentData,
  ): Promise<Assignment> {
    const response = await apiClient.put<Assignment>(
      `/assignments/${id}`,
      data,
    );
    return response.data;
  },

  /**
   * Delete assignment
   */
  async deleteAssignment(id: number): Promise<void> {
    await apiClient.delete(`/assignments/${id}`);
  },

  /**
   * Assign brigadista to assignment
   */
  async assignBrigadista(
    id: number,
    brigadistaId: number,
  ): Promise<Assignment> {
    const response = await apiClient.post<Assignment>(
      `/assignments/${id}/assign`,
      { brigadista_id: brigadistaId },
    );
    return response.data;
  },

  /**
   * Update assignment status
   */
  async updateStatus(id: number, estado: string): Promise<Assignment> {
    const response = await apiClient.patch<Assignment>(
      `/assignments/${id}/status`,
      { estado },
    );
    return response.data;
  },

  /**
   * Bulk create assignments
   */
  async bulkCreate(assignments: CreateAssignmentData[]): Promise<Assignment[]> {
    const response = await apiClient.post<Assignment[]>("/assignments/bulk", {
      assignments,
    });
    return response.data;
  },
};
