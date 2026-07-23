import React, { useEffect } from 'react';
import {
  FiGrid,
  FiUsers,
  FiFolder,
  FiCpu,
  FiActivity,
  FiList,
  FiSettings,
  FiRefreshCw,
  FiShield,
  FiCheckCircle,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useAdminStore, type AdminTab } from '../store/admin-store';

// =============================================================================
// DevSync AI — Admin Layout Container
// Layout shell providing sidebar navigation, system health telemetry bar,
// auto-refresh triggers, and active tab content viewport.
// =============================================================================

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    health,
    fetchSystemHealth,
    fetchDashboardStats,
    refreshAll,
    isLoadingStats,
  } = useAdminStore();

  useEffect(() => {
    void fetchDashboardStats();
    void fetchSystemHealth();

    // Auto-refresh health metrics every 30s
    const interval = setInterval(() => {
      void fetchSystemHealth();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardStats, fetchSystemHealth]);

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ReactNode }> = [
    { id: 'overview', label: 'Overview', icon: <FiGrid className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <FiUsers className="w-4 h-4" /> },
    { id: 'workspaces', label: 'Workspaces', icon: <FiFolder className="w-4 h-4" /> },
    { id: 'ai-analytics', label: 'AI Analytics', icon: <FiCpu className="w-4 h-4" /> },
    { id: 'system-health', label: 'System Health', icon: <FiActivity className="w-4 h-4" /> },
    { id: 'logs', label: 'Logs Viewer', icon: <FiList className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <FiSettings className="w-4 h-4" /> },
  ];

  const getOverallBadge = () => {
    if (!health) return null;
    const isOk = health.overallStatus === 'healthy';

    return (
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
          isOk
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        }`}
      >
        {isOk ? (
          <FiCheckCircle className="w-3.5 h-3.5" />
        ) : (
          <FiAlertTriangle className="w-3.5 h-3.5" />
        )}
        <span className="capitalize">{health.overallStatus}</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between p-4 flex-shrink-0">
        <div>
          {/* Admin Header */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800 mb-6">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/30">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100 tracking-wide">DevSync Admin</h2>
              <p className="text-[11px] text-slate-400">Control & Monitoring</p>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between items-center">
            <span>Gateway API</span>
            <span className="text-emerald-400 font-semibold">Online</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Version</span>
            <span className="font-mono text-slate-300">v0.1.0</span>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-950">
        {/* Top Action Header */}
        <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-slate-100 capitalize">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h1>
            {getOverallBadge()}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => refreshAll()}
              disabled={isLoadingStats}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingStats ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">{children}</div>
      </main>
    </div>
  );
};
