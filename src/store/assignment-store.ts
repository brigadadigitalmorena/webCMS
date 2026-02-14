import { create } from "zustand";
import { Assignment, PaginatedResponse } from "@/types";

interface AssignmentState {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    estado?: string;
    encargado_id?: number;
    brigadista_id?: number;
    encuesta_id?: number;
  };
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };

  // Actions
  setAssignments: (response: PaginatedResponse<Assignment>) => void;
  setSelectedAssignment: (assignment: Assignment | null) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: number, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: number) => void;
  setFilters: (filters: Partial<AssignmentState["filters"]>) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  selectedAssignment: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    size: 10,
    total: 0,
    pages: 0,
  },

  setAssignments: (response) =>
    set({
      assignments: response.items,
      pagination: {
        page: response.page,
        size: response.size,
        total: response.total,
        pages: response.pages,
      },
    }),

  setSelectedAssignment: (assignment) =>
    set({ selectedAssignment: assignment }),

  addAssignment: (assignment) =>
    set((state) => ({
      assignments: [...state.assignments, assignment],
    })),

  updateAssignment: (id, updatedAssignment) =>
    set((state) => ({
      assignments: state.assignments.map((assignment) =>
        assignment.id === id
          ? { ...assignment, ...updatedAssignment }
          : assignment,
      ),
      selectedAssignment:
        state.selectedAssignment?.id === id
          ? { ...state.selectedAssignment, ...updatedAssignment }
          : state.selectedAssignment,
    })),

  deleteAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter(
        (assignment) => assignment.id !== id,
      ),
      selectedAssignment:
        state.selectedAssignment?.id === id ? null : state.selectedAssignment,
    })),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  clearFilters: () => set({ filters: {} }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),
}));
