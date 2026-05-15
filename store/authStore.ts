import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  /** True once the store has finished rehydrating from SecureStore. */
  _hasHydrated: boolean;

  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  setUser: (user: AuthUser | null) => void;
  setAuth: (payload: { accessToken: string; refreshToken: string; user: AuthUser }) => void;
  clearAuth: () => void;
  setHasHydrated: (state: boolean) => void;
}

// ─── SecureStore adapter for Zustand persist ─────────────────────────────────
// expo-secure-store enforces a 2 048-byte value limit per key.
// Tokens + user profile are stored together under one key; if your JWTs are
// unusually long, consider splitting the persisted state across multiple keys.

const secureStorage = createJSONStorage(() => ({
  getItem: (name: string) => SecureStore.getItemAsync(name),
  setItem: (name: string, value: string) => SecureStore.setItemAsync(name, value),
  removeItem: (name: string) => SecureStore.deleteItemAsync(name),
}));

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      _hasHydrated: false,

      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),

      setUser: (user) => set({ user }),

      setAuth: ({ accessToken, refreshToken, user }) =>
        set({ accessToken, refreshToken, user }),

      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null }),

      setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: 'gitfit-auth',
      storage: secureStorage,
      // _hasHydrated is a runtime-only flag — never persist it
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
