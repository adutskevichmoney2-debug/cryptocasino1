import { create } from "zustand";
import { services } from "@/services";
import type { Result, Session, UserProfile } from "@/services/types";

type AuthStatus = "loading" | "guest" | "authed";

interface AuthState {
  user: UserProfile | null;
  status: AuthStatus;
  init: () => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<Result<Session>>;
  register: (input: {
    email: string;
    password: string;
    nickname?: string;
    refCode?: string;
  }) => Promise<Result<Session>>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
}

let initialized = false;

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "loading",

  async init() {
    if (initialized) return;
    initialized = true;
    services.auth.onAuthChange((session) => {
      set({ user: session?.user ?? null, status: session ? "authed" : "guest" });
    });
    const session = await services.auth.getSession();
    set({ user: session?.user ?? null, status: session ? "authed" : "guest" });
  },

  async login(input) {
    const result = await services.auth.login(input);
    if (result.ok) set({ user: result.data.user, status: "authed" });
    return result;
  },

  async register(input) {
    const result = await services.auth.register(input);
    if (result.ok) set({ user: result.data.user, status: "authed" });
    return result;
  },

  async logout() {
    await services.auth.logout();
    set({ user: null, status: "guest" });
  },

  setUser: (user) => set({ user, status: user ? "authed" : "guest" }),
}));
