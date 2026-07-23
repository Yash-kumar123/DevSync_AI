import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@store/auth-store';
import type { ReactNode } from 'react';

// =============================================================================
// DevSync AI — PublicRoute
// Renders children only when the user is NOT authenticated.
// Authenticated users are redirected to /dashboard.
// Used to wrap the Login and Register pages.
// =============================================================================

interface PublicRouteProps {
  children: ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Wait for the bootstrap check before deciding
  if (isLoading) return null;

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
