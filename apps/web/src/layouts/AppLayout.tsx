import { Outlet } from 'react-router-dom';

// =============================================================================
// DevSync AI — App Layout
// Root layout shell that renders page content via <Outlet />.
// Individual pages (Login, Dashboard, etc.) control their own full-page layout.
// =============================================================================

export function AppLayout() {
  return <Outlet />;
}
