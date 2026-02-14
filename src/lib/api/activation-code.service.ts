import apiClient from "./client";
import {
  ActivationCode,
  ActivationStatsResponse,
  GenerateCodeRequest,
  GenerateCodeResponse,
  ListActivationCodesParams,
  ListActivationCodesResponse,
  ListAuditLogsParams,
  ListAuditLogsResponse,
  RevokeCodeRequest,
  RevokeCodeResponse,
} from "@/types/activation";

/**
 * Activation Codes API Service
 * Handles all activation code operations
 */
export const activationCodeService = {
  /**
   * List activation codes with filters
   */
  async list(
    params?: ListActivationCodesParams,
  ): Promise<ListActivationCodesResponse> {
    const response = await apiClient.get<ListActivationCodesResponse>(
      "/admin/activation-codes",
      { params },
    );
    return response.data;
  },

  /**
   * Get single activation code details
   */
  async getById(id: number): Promise<ActivationCode> {
    const response = await apiClient.get<ActivationCode>(
      `/admin/activation-codes/${id}`,
    );
    return response.data;
  },

  /**
   * Generate new activation code for whitelist entry
   */
  async generate(data: GenerateCodeRequest): Promise<GenerateCodeResponse> {
    const response = await apiClient.post<GenerateCodeResponse>(
      "/admin/activation-codes/generate",
      data,
    );
    return response.data;
  },

  /**
   * Revoke activation code
   */
  async revoke(
    id: number,
    data: RevokeCodeRequest,
  ): Promise<RevokeCodeResponse> {
    const response = await apiClient.post<RevokeCodeResponse>(
      `/admin/activation-codes/${id}/revoke`,
      data,
    );
    return response.data;
  },

  /**
   * Extend activation code expiration
   */
  async extend(
    id: number,
    additional_hours: number,
  ): Promise<{ success: boolean; new_expires_at: string }> {
    const response = await apiClient.post(
      `/admin/activation-codes/${id}/extend`,
      { additional_hours },
    );
    return response.data;
  },

  /**
   * Resend activation email
   */
  async resendEmail(
    id: number,
    custom_message?: string,
  ): Promise<{ success: boolean; email_sent: boolean }> {
    const response = await apiClient.post(
      `/admin/activation-codes/${id}/resend-email`,
      { custom_message },
    );
    return response.data;
  },

  /**
   * Get activation audit logs
   */
  async getAuditLogs(
    params?: ListAuditLogsParams,
  ): Promise<ListAuditLogsResponse> {
    const response = await apiClient.get<ListAuditLogsResponse>(
      "/admin/activation-audit",
      { params },
    );
    return response.data;
  },

  /**
   * Get activation statistics
   */
  async getStats(): Promise<ActivationStatsResponse> {
    const response = await apiClient.get<ActivationStatsResponse>(
      "/admin/activation-audit/stats",
    );
    return response.data;
  },

  /**
   * Get activation attempts for a specific code
   */
  async getAttempts(codeId: number): Promise<ListAuditLogsResponse> {
    const response = await apiClient.get<ListAuditLogsResponse>(
      "/admin/activation-audit",
      {
        params: {
          activation_code_id: codeId,
          limit: 100,
        },
      },
    );
    return response.data;
  },
};
