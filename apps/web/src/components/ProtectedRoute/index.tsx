import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth-store';
import type { ReactNode } from 'react';

// =============================================================================
// DevSync AI — ProtectedRoute
// Renders children only when the user is authenticated.
// Redirects to /login and preserves the original path in location state
// so the user can be sent back after logging in.
// =============================================================================

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  // While bootstrap is running, render a full-page loader
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Full-page loading screen shown during the auth bootstrap check
// ---------------------------------------------------------------------------

function AuthLoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        {/* Animated brand logo pulse */}
        <div className="relative">
          <img
            src="/devsync-icon.png"
            alt="DevSync AI"
            className="h-16 w-16 object-contain rounded-2xl shadow-glow-brand animate-pulse"
          />
          <div className="absolute inset-0 rounded-2xl bg-brand-500/30 blur-xl opacity-50 animate-pulse -z-10" />
        </div>
        <p className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">
          Loading DevSync AI…
        </p>
      </div>
    </div>
  );
}
