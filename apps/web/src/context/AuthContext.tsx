import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuthStore } from '@store/auth-store';
import * as authApi from '@services/auth.service';
import type { LoginPayload, RegisterPayload } from '@types';

// =============================================================================
// DevSync AI — Auth Context
// Wraps the Zustand auth store with lifecycle logic (bootstrap, login, logout).
// Provides action functions with integrated toast notifications.
// =============================================================================

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

export interface AuthContextValue {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { setAuth, clearAuth, setLoading, isAuthenticated, accessToken } = useAuthStore();
  const [bootstrapDone, setBootstrapDone] = useState(false);

  // ── Bootstrap ─────────────────────────────────────────────────────────────
  // On first mount, if we have a stored access token, verify it by fetching
  // the user profile. If the token is expired, the Axios interceptor will
  // attempt a silent refresh automatically.
  useEffect(() => {
    async function bootstrap() {
      if (!isAuthenticated || !accessToken) {
        setLoading(false);
        setBootstrapDone(true);
        return;
      }

      try {
        const user = await authApi.getMe();
        const stored = useAuthStore.getState();
        setAuth(user, stored.accessToken!, stored.expiresAt!);
      } catch {
        // Token invalid and refresh failed — clear stale state
        clearAuth();
      } finally {
        setLoading(false);
        setBootstrapDone(true);
      }
    }

    void bootstrap();
  }, []); // Run only on mount

  // ── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (payload: LoginPayload) => {
      try {
        const { user, accessToken, expiresAt } = await authApi.login(payload);
        setAuth(user, accessToken, expiresAt);
        toast.success(`Welcome back, ${user.displayName}! 👋`);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        const message = extractErrorMessage(error, 'Login failed. Please try again.');
        toast.error(message);
        throw error; // Re-throw so form can reset loading state
      }
    },
    [setAuth, navigate],
  );

  // ── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(
    async (payload: RegisterPayload) => {
      try {
        const { user, accessToken, expiresAt } = await authApi.register(payload);
        setAuth(user, accessToken, expiresAt);
        toast.success(`Welcome to DevSync AI, ${user.displayName}! 🚀`);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        const message = extractErrorMessage(error, 'Registration failed. Please try again.');
        toast.error(message);
        throw error;
      }
    },
    [setAuth, navigate],
  );

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors — still clear local state
    } finally {
      clearAuth();
      toast.success('You have been logged out.');
      navigate('/', { replace: true });
    }
  }, [clearAuth, navigate]);

  // Don't render children until the bootstrap check is complete
  // (prevents a flash of unauthenticated content)
  if (!bootstrapDone) return null;

  return (
    <AuthContext.Provider value={{ login, register, logout }}>{children}</AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/** Extract a human-readable error message from an Axios or unknown error. */
function extractErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      { error?: { message?: string }; message?: string } | undefined;
    return data?.error?.message ?? data?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
