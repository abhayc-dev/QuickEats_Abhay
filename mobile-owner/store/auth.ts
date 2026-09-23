import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { User } from "../types";

const TOKEN_KEY = "chakiyaeats_owner_token";
const USER_KEY = "chakiyaeats_owner_user";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  signIn: (user: User, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const [token, userJson] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);
      set({
        token: token ?? null,
        user: userJson ? JSON.parse(userJson) : null,
        hydrated: true,
      });
    } catch {
      set({ hydrated: true });
    }
  },

  signIn: async (user, token) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_KEY, token),
      SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
    ]);
    set({ user, token });
  },

  signOut: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
    set({ user: null, token: null });
  },

  setUser: (user) => set({ user }),
}));
