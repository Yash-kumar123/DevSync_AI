import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@types';

// =============================================================================
// DevSync AI — Auth Store (Zustand)
// Persists the access token and user profile to localStorage.
// Refresh token is stored in an HttpOnly cookie (never accessible to JS).
// =============================================================================

interface AuthState {
  /** The currently authenticated user, or null if not logged in. */
  user: User | null;
  /** JWT access token (short-lived). Stored in localStorage for axios interceptors. */
  accessToken: string | null;
  /** Unix timestamp (ms) when the access token expires. */
  expiresAt: number | null;
  /** True when the user has a valid session. */
  isAuthenticated: boolean;
  /** True while the initial auth check (bootstrap) is in progress. */
  isLoading: boolean;
}

interface AuthActions {
  /** Set user and tokens after a successful login/register/refresh. */
  setAuth: (user: User, accessToken: string, expiresAt: number) => void;
  /** Clear all auth state on logout or session expiry. */
  clearAuth: () => void;
  /** Toggle the loading state during the bootstrap check. */
  setLoading: (loading: boolean) => void;
  /** Update only the access token (e.g., after a silent refresh). */
  updateAccessToken: (accessToken: string, expiresAt: number) => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  expiresAt: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading until bootstrap completes
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (user, accessToken, expiresAt) =>
        set({ user, accessToken, expiresAt, isAuthenticated: true, isLoading: false }),

      clearAuth: () => set({ ...initialState, isLoading: false }),

      setLoading: (isLoading) => set({ isLoading }),

      updateAccessToken: (accessToken, expiresAt) => set({ accessToken, expiresAt }),
    }),
    {
      name: 'devsync_auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist user profile and token — not isLoading
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
