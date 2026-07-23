import React from 'react';
import { useAdminStore } from '../store/admin-store';
import { AdminLayout } from './AdminLayout';
import { OverviewPage } from '../pages/OverviewPage';
import { UsersPage } from '../pages/UsersPage';
import { WorkspacesPage } from '../pages/WorkspacesPage';
import { AIAnalyticsPage } from '../pages/AIAnalyticsPage';
import { SystemHealthPage } from '../pages/SystemHealthPage';
import { LogsPage } from '../pages/LogsPage';
import { SettingsPage } from '../pages/SettingsPage';

// =============================================================================
// DevSync AI — Admin Dashboard Container
// Main tab switcher rendering AdminLayout shell and dynamic page views.
// =============================================================================

export const AdminDashboard: React.FC = () => {
  const activeTab = useAdminStore((s) => s.activeTab);

  const renderActivePage = () => {
    switch (activeTab) {
      case 'users':
        return <UsersPage />;
      case 'workspaces':
        return <WorkspacesPage />;
      case 'ai-analytics':
        return <AIAnalyticsPage />;
      case 'system-health':
        return <SystemHealthPage />;
      case 'logs':
        return <LogsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'overview':
      default:
        return <OverviewPage />;
    }
  };

  return <AdminLayout>{renderActivePage()}</AdminLayout>;
};
