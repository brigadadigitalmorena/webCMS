import { create } from "zustand";
import { User, PaginatedResponse } from "@/types";

interface UserState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
    pages: number;
  };

  // Actions
  setUsers: (response: PaginatedResponse<User>) => void;
  setSelectedUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: number, user: Partial<User>) => void;
  deleteUser: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    size: 10,
    total: 0,
    pages: 0,
  },

  setUsers: (response) =>
    set({
      users: response.items,
      pagination: {
        page: response.page,
        size: response.size,
        total: response.total,
        pages: response.pages,
      },
    }),

  setSelectedUser: (user) => set({ selectedUser: user }),

  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),

  updateUser: (id, updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updatedUser } : user,
      ),
      selectedUser:
        state.selectedUser?.id === id
          ? { ...state.selectedUser, ...updatedUser }
          : state.selectedUser,
    })),

  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
      selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPage: (page) =>
    set((state) => ({
      pagination: { ...state.pagination, page },
    })),
}));
