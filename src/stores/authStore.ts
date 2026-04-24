import { create } from "zustand";

type Role = "user" | "admin" | null;

interface AuthState {
  token: string | null;
  role: Role;
  userId: string | null;

  login: (data: {
    token: string;
    role: Role;
    userId: string;
  }) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  role: (localStorage.getItem("role") as Role) || null,
  userId: localStorage.getItem("userId"),

  login: ({ token, role, userId }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role || "");
    localStorage.setItem("userId", userId);

    set({ token, role, userId });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    set({ token: null, role: null, userId: null });
  }
}));