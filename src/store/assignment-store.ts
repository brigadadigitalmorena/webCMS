import { create } from "zustand";
import { Assignment, AssignmentStatus } from "@/types";

interface AssignmentState {
  assignments: Assignment[];
  selectedAssignment: Assignment | null;
  isLoading: boolean;
  error: string | null;
  filterStatus: AssignmentStatus | "";

  // Actions
  setAssignments: (assignments: Assignment[]) => void;
  setSelectedAssignment: (assignment: Assignment | null) => void;
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: number, assignment: Partial<Assignment>) => void;
  deleteAssignment: (id: number) => void;
  setFilterStatus: (status: AssignmentStatus | "") => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAssignmentStore = create<AssignmentState>((set) => ({
  assignments: [],
  selectedAssignment: null,
  isLoading: false,
  error: null,
  filterStatus: "",

  setAssignments: (assignments) => set({ assignments }),

  setSelectedAssignment: (assignment) =>
    set({ selectedAssignment: assignment }),

  addAssignment: (assignment) =>
    set((state) => ({
      assignments: [assignment, ...state.assignments],
    })),

  updateAssignment: (id, updatedAssignment) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a.id === id ? { ...a, ...updatedAssignment } : a,
      ),
      selectedAssignment:
        state.selectedAssignment?.id === id
          ? { ...state.selectedAssignment, ...updatedAssignment }
          : state.selectedAssignment,
    })),

  deleteAssignment: (id) =>
    set((state) => ({
      assignments: state.assignments.filter((a) => a.id !== id),
      selectedAssignment:
        state.selectedAssignment?.id === id ? null : state.selectedAssignment,
    })),

  setFilterStatus: (status) => set({ filterStatus: status }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
