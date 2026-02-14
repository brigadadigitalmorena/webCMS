import { create } from "zustand";
import { activationCodeService } from "@/lib/api/activation-code.service";
import {
  ActivationCode,
  ActivationCodeStatus,
  ActivationStatsResponse,
  GenerateCodeRequest,
  ListActivationCodesParams,
  ListAuditLogsParams,
  ActivationAuditLog,
} from "@/types/activation";

interface ActivationCodeState {
  // Data
  codes: ActivationCode[];
  selectedCode: ActivationCode | null;
  auditLogs: ActivationAuditLog[];
  stats: ActivationStatsResponse | null;
  generatedCode: string | null; // Plain code shown once after generation

  // Pagination
  currentPage: number;
  totalPages: number;
  totalItems: number;

  // Filters
  statusFilter: ActivationCodeStatus | "all";
  searchTerm: string;

  // UI State
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;
  showGeneratedCode: boolean;

  // Actions - Data fetching
  fetchCodes: (params?: ListActivationCodesParams) => Promise<void>;
  fetchCodeById: (id: number) => Promise<void>;
  fetchAuditLogs: (params?: ListAuditLogsParams) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchCodeAttempts: (codeId: number) => Promise<void>;

  // Actions - Code management
  generateCode: (data: GenerateCodeRequest) => Promise<void>;
  revokeCode: (id: number, reason: string) => Promise<void>;
  extendCode: (id: number, hours: number) => Promise<void>;
  resendEmail: (id: number, message?: string) => Promise<void>;

  // Actions - UI state
  setStatusFilter: (status: ActivationCodeStatus | "all") => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setSelectedCode: (code: ActivationCode | null) => void;
  clearGeneratedCode: () => void;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  codes: [],
  selectedCode: null,
  auditLogs: [],
  stats: null,
  generatedCode: null,
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  statusFilter: "all" as const,
  searchTerm: "",
  isLoading: false,
  isGenerating: false,
  error: null,
  showGeneratedCode: false,
};

export const useActivationCodeStore = create<ActivationCodeState>(
  (set, get) => ({
    ...initialState,

    // ===================================
    // Data Fetching Actions
    // ===================================

    fetchCodes: async (params?: ListActivationCodesParams) => {
      set({ isLoading: true, error: null });
      try {
        const response = await activationCodeService.list({
          ...params,
          page: params?.page || get().currentPage,
          status: params?.status || get().statusFilter,
        });

        set({
          codes: response.items,
          currentPage: response.pagination.page,
          totalPages: response.pagination.total_pages,
          totalItems: response.pagination.total_items,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error:
            error.response?.data?.message || "Failed to fetch activation codes",
          isLoading: false,
        });
      }
    },

    fetchCodeById: async (id: number) => {
      set({ isLoading: true, error: null });
      try {
        const code = await activationCodeService.getById(id);
        set({
          selectedCode: code,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error:
            error.response?.data?.message || "Failed to fetch code details",
          isLoading: false,
        });
      }
    },

    fetchAuditLogs: async (params?: ListAuditLogsParams) => {
      set({ isLoading: true, error: null });
      try {
        const response = await activationCodeService.getAuditLogs(params);
        set({
          auditLogs: response.items,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || "Failed to fetch audit logs",
          isLoading: false,
        });
      }
    },

    fetchStats: async () => {
      try {
        const stats = await activationCodeService.getStats();
        set({ stats });
      } catch (error: any) {
        console.error("Failed to fetch stats:", error);
      }
    },

    fetchCodeAttempts: async (codeId: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await activationCodeService.getAttempts(codeId);
        set({
          auditLogs: response.items,
          isLoading: false,
        });
      } catch (error: any) {
        set({
          error:
            error.response?.data?.message ||
            "Failed to fetch activation attempts",
          isLoading: false,
        });
      }
    },

    // ===================================
    // Code Management Actions
    // ===================================

    generateCode: async (data: GenerateCodeRequest) => {
      set({ isGenerating: true, error: null, generatedCode: null });
      try {
        const response = await activationCodeService.generate(data);

        set({
          generatedCode: response.code, // Plain code - only time it's visible
          showGeneratedCode: true,
          isGenerating: false,
        });

        // Refresh codes list
        await get().fetchCodes();
      } catch (error: any) {
        set({
          error:
            error.response?.data?.message ||
            "Failed to generate activation code",
          isGenerating: false,
        });
        throw error;
      }
    },

    revokeCode: async (id: number, reason: string) => {
      set({ isLoading: true, error: null });
      try {
        await activationCodeService.revoke(id, { reason });

        // Update code in list
        set((state) => ({
          codes: state.codes.map((code) =>
            code.id === id ? { ...code, status: "revoked" as const } : code,
          ),
          isLoading: false,
        }));

        // Refresh to get latest data
        await get().fetchCodes();
      } catch (error: any) {
        set({
          error: error.response?.data?.message || "Failed to revoke code",
          isLoading: false,
        });
        throw error;
      }
    },

    extendCode: async (id: number, hours: number) => {
      set({ isLoading: true, error: null });
      try {
        const response = await activationCodeService.extend(id, hours);

        // Update code in list
        set((state) => ({
          codes: state.codes.map((code) =>
            code.id === id
              ? { ...code, expires_at: response.new_expires_at }
              : code,
          ),
          isLoading: false,
        }));

        // Refresh to get latest data
        await get().fetchCodes();
      } catch (error: any) {
        set({
          error:
            error.response?.data?.message || "Failed to extend code expiration",
          isLoading: false,
        });
        throw error;
      }
    },

    resendEmail: async (id: number, message?: string) => {
      set({ isLoading: true, error: null });
      try {
        await activationCodeService.resendEmail(id, message);
        set({ isLoading: false });
      } catch (error: any) {
        set({
          error: error.response?.data?.message || "Failed to resend email",
          isLoading: false,
        });
        throw error;
      }
    },

    // ===================================
    // UI State Actions
    // ===================================

    setStatusFilter: (status) => {
      set({ statusFilter: status, currentPage: 1 });
      get().fetchCodes();
    },

    setSearchTerm: (term) => {
      set({ searchTerm: term });
    },

    setCurrentPage: (page) => {
      set({ currentPage: page });
      get().fetchCodes();
    },

    setSelectedCode: (code) => {
      set({ selectedCode: code });
    },

    clearGeneratedCode: () => {
      set({ generatedCode: null, showGeneratedCode: false });
    },

    clearError: () => {
      set({ error: null });
    },

    reset: () => {
      set(initialState);
    },
  }),
);
