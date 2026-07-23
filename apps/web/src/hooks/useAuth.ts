import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@context/AuthContext';
import { useAuthStore } from '@store/auth-store';
import type { User } from '@types';

// =============================================================================
// DevSync AI — useAuth Hook
// Combines AuthContext actions with Zustand auth store state.
// This is the single hook that all components should import.
// =============================================================================

export interface UseAuthReturn extends AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

/**
 * Provides the current auth state and action functions.
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an <AuthProvider>. Check your component tree.');
  }

  const { user, isAuthenticated, isLoading, accessToken } = useAuthStore();

  return {
    ...context,
    user,
    isAuthenticated,
    isLoading,
    accessToken,
  };
}
