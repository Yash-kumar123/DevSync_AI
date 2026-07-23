import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@context/AuthContext';
import { ProtectedRoute } from '@components/ProtectedRoute';
import { PublicRoute } from '@components/PublicRoute';
import { AppLayout } from '@layouts/AppLayout';
import { DashboardPage } from '@pages/Dashboard';
import { HomePage } from '@pages/Home';
import { LoginPage } from '@pages/Login';
import { NotFoundPage } from '@pages/NotFound';
import { RegisterPage } from '@pages/Register';
import { WorkspacePage } from '@pages/Workspace';
import { WorkspaceDetailPage } from '@pages/WorkspaceDetail';
import { AdminDashboard } from '../features/admin';

// =============================================================================
// DevSync AI — Application Router
//
// Route map:
//   /                 → HomePage (public)
//   /login            → LoginPage (public, redirect if authed)
//   /register         → RegisterPage (public, redirect if authed)
//   /dashboard        → DashboardPage (protected)
//   /admin            → AdminDashboard (protected)
//   /workspace/:workspaceId  → WorkspaceDetailPage (protected, by DB id)
//   /workspace/:roomCode     → WorkspacePage (protected, the IDE room)
// =============================================================================

export function AppRouter() {
  return (
    <BrowserRouter>
      {/* AuthProvider must be inside BrowserRouter to use useNavigate */}
      <AuthProvider>
        <Routes>
          <Route element={<AppLayout />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />

            {/* Auth routes — redirect to /dashboard if already logged in */}
            <Route
              path="login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Dashboard route */}
            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Workspace Detail */}
            <Route
              path="workspace/details/:workspaceId"
              element={
                <ProtectedRoute>
                  <WorkspaceDetailPage />
                </ProtectedRoute>
              }
            />

            {/* Workspace Room */}
            <Route
              path="workspace/:roomCode"
              element={
                <ProtectedRoute>
                  <WorkspacePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="workspace/room/:roomCode"
              element={
                <ProtectedRoute>
                  <WorkspacePage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
