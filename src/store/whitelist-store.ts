/**
 * Whitelist Store
 * Manages whitelist state and operations
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { whitelistService } from "@/lib/api/whitelist.service";
import {
  WhitelistEntry,
  CreateWhitelistRequest,
  CreateWhitelistResponse,
  WhitelistUpdate,
  ListWhitelistParams,
} from "@/types/activation";

interface WhitelistStats {
  total_entries: number;
  activated: number;
  pending: number;
  with_active_codes: number;
}

interface WhitelistState {
  // Data
  entries: WhitelistEntry[];
  selectedEntry: WhitelistEntry | null;
  stats: WhitelistStats | null;

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  error: string | null;

  // Filters & Pagination
  statusFilter: "all" | "pending" | "activated";
  roleFilter: string | null;
  searchTerm: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;

  // Actions
  fetchEntries: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchById: (id: number) => Promise<void>;
  createEntry: (
    data: CreateWhitelistRequest,
  ) => Promise<CreateWhitelistResponse>;
  updateEntry: (id: number, data: WhitelistUpdate) => Promise<void>;
  deleteEntry: (id: number) => Promise<void>;

  // Filters
  setStatusFilter: (status: "all" | "pending" | "activated") => void;
  setRoleFilter: (role: string | null) => void;
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;

  // UI
  setSelectedEntry: (entry: WhitelistEntry | null) => void;
  clearError: () => void;
}

export const useWhitelistStore = create<WhitelistState>()(
  persist(
    (set, get) => ({
      // Initial State
      // ===================================
      entries: [],
      selectedEntry: null,
      stats: null,
      isLoading: false,
      isCreating: false,
      isUpdating: false,
      error: null,
      statusFilter: "all",
      roleFilter: null,
      searchTerm: "",
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,

      // Data Fetching Actions
      // ===================================

      fetchEntries: async () => {
        set({ isLoading: true, error: null });
        try {
          const params: ListWhitelistParams = {
            page: get().currentPage,
            limit: 20,
            status: get().statusFilter,
            role:
              (get().roleFilter as import("@/types/index").UserRole) ||
              undefined,
            search: get().searchTerm || undefined,
          };

          const response = await whitelistService.list(params);

          set({
            entries: response.items,
            totalPages: response.pagination.total_pages,
            totalItems: response.pagination.total_items,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch whitelist entries",
            isLoading: false,
          });
        }
      },

      fetchStats: async () => {
        try {
          // Calculate stats from entries for now
          // TODO: Implement dedicated stats endpoint if needed
          const entries = get().entries;
          const stats: WhitelistStats = {
            total_entries: entries.length,
            activated: entries.filter((e) => e.is_activated).length,
            pending: entries.filter((e) => !e.is_activated).length,
            with_active_codes: entries.filter((e) => e.has_active_code).length,
          };
          set({ stats });
        } catch (error) {
          console.error("Failed to calculate stats:", error);
        }
      },

      fetchById: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          const entry = await whitelistService.getById(id);
          set({ selectedEntry: entry, isLoading: false });
        } catch (error: any) {
          set({
            error:
              error.response?.data?.message ||
              "Failed to fetch whitelist entry",
            isLoading: false,
          });
        }
      },

      createEntry: async (data: CreateWhitelistRequest) => {
        set({ isCreating: true, error: null });
        try {
          const newEntry = await whitelistService.create(data);
          set({ isCreating: false });

          // Refresh entries list
          await get().fetchEntries();

          return newEntry;
        } catch (error: any) {
          set({
            error:
              error.response?.data?.detail ||
              error.response?.data?.message ||
              "Failed to create whitelist entry",
            isCreating: false,
          });
          throw error;
        }
      },

      updateEntry: async (id: number, data: WhitelistUpdate) => {
        set({ isUpdating: true, error: null });
        try {
          await whitelistService.update(id, data);
          set({ isUpdating: false });

          // Refresh entries list
          await get().fetchEntries();
        } catch (error: any) {
          set({
            error:
              error.response?.data?.detail ||
              error.response?.data?.message ||
              "Failed to update whitelist entry",
            isUpdating: false,
          });
          throw error;
        }
      },

      deleteEntry: async (id: number) => {
        set({ isLoading: true, error: null });
        try {
          await whitelistService.delete(id);
          set({ isLoading: false });

          // Refresh entries list
          await get().fetchEntries();
        } catch (error: any) {
          set({
            error:
              error.response?.data?.detail ||
              error.response?.data?.message ||
              "Failed to delete whitelist entry",
            isLoading: false,
          });
          throw error;
        }
      },

      // Filter Actions
      // ===================================

      setStatusFilter: (status) => {
        set({ statusFilter: status, currentPage: 1 });
        get().fetchEntries();
      },

      setRoleFilter: (role) => {
        set({ roleFilter: role, currentPage: 1 });
        get().fetchEntries();
      },

      setSearchTerm: (term) => {
        set({ searchTerm: term, currentPage: 1 });
      },

      setCurrentPage: (page) => {
        set({ currentPage: page });
        get().fetchEntries();
      },

      // UI Actions
      // ===================================

      setSelectedEntry: (entry) => {
        set({ selectedEntry: entry });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "whitelist-store",
      partialize: (state) => ({
        statusFilter: state.statusFilter,
        roleFilter: state.roleFilter,
        searchTerm: state.searchTerm,
        currentPage: state.currentPage,
      }),
    },
  ),
);
