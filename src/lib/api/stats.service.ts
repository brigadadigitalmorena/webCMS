import apiClient from "./client";

export interface AdminStats {
  totalUsers: number;
  activeSurveys: number;
  completedAssignments: number;
  totalResponses: number;
  pendingAssignments: number;
  activeBrigadistas: number;
  responseRate: number;
  totalAssignments: number;
}

export const statsService = {
  async getAdminStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>("/admin/stats");
    return response.data;
  },
};
