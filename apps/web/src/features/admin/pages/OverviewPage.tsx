import React, { useEffect } from 'react';
import { FiUsers, FiFolder, FiCpu, FiHardDrive, FiActivity, FiServer } from 'react-icons/fi';
import { useAdminStore } from '../store/admin-store';
import { StatCard } from '../components/StatCard';
import { LineChart, BarChart, AreaChart, DonutChart } from '../components/ChartComponents';

// =============================================================================
// DevSync AI — Overview Page
// Displays high-level KPI cards (Users, Active Rooms, AI Requests, CPU, Memory,
// Storage) and interactive charts (Daily Users, AI Usage, Workspace Growth, API Requests).
// =============================================================================

export const OverviewPage: React.FC = () => {
  const { stats, isLoadingStats, fetchDashboardStats } = useAdminStore();

  useEffect(() => {
    void fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (isLoadingStats && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Loading Admin Telemetry...</span>
      </div>
    );
  }

  const formatStorage = (bytes?: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const dailyUsersData =
    stats?.charts.dailyUsers.map((d) => ({ label: d.date.slice(5), value: d.count })) || [];

  const workspaceGrowthData =
    stats?.charts.workspaceGrowth.map((d) => ({ label: d.date.slice(5), value: d.count })) || [];

  const aiUsageData =
    stats?.charts.aiUsage.map((d) => ({
      label: d.model.split('-')[1] || d.model,
      value: d.count,
    })) || [];

  const storageItems = [
    {
      label: 'Source Code Files',
      value: Math.round(((stats?.storageUsageBytes || 0) * 0.6) / 1024 / 1024),
      color: '#818CF8',
    },
    {
      label: 'Workspaces Meta',
      value: Math.round(((stats?.storageUsageBytes || 0) * 0.25) / 1024 / 1024),
      color: '#34D399',
    },
    {
      label: 'Logs & Metrics',
      value: Math.round(((stats?.storageUsageBytes || 0) * 0.15) / 1024 / 1024),
      color: '#FBBF24',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Overview KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          subValue={`${stats?.activeUsers ?? 0} active accounts`}
          trend={{ percentage: 12, isUp: true }}
          icon={<FiUsers className="w-5 h-5" />}
        />

        <StatCard
          title="Active Rooms"
          value={stats?.activeWorkspaces ?? 0}
          subValue={`${stats?.totalWorkspaces ?? 0} total workspaces`}
          trend={{ percentage: 8, isUp: true }}
          icon={<FiFolder className="w-5 h-5" />}
          iconBgColor="bg-emerald-500/10 border-emerald-500/20"
          iconTextColor="text-emerald-400"
        />

        <StatCard
          title="AI Requests"
          value={stats?.aiRequests?.toLocaleString() ?? 0}
          subValue="Past 24 hours"
          trend={{ percentage: 24, isUp: true }}
          icon={<FiCpu className="w-5 h-5" />}
          iconBgColor="bg-purple-500/10 border-purple-500/20"
          iconTextColor="text-purple-400"
        />

        <StatCard
          title="CPU Usage"
          value={`${stats?.cpuUsagePercent ?? 0}%`}
          subValue="Process Load"
          trend={{ percentage: -2, isUp: false }}
          icon={<FiActivity className="w-5 h-5" />}
          iconBgColor="bg-sky-500/10 border-sky-500/20"
          iconTextColor="text-sky-400"
        />

        <StatCard
          title="Memory Usage"
          value={`${stats?.memoryUsagePercent ?? 0}%`}
          subValue="Heap Allocated"
          trend={{ percentage: 4, isUp: true }}
          icon={<FiServer className="w-5 h-5" />}
          iconBgColor="bg-amber-500/10 border-amber-500/20"
          iconTextColor="text-amber-400"
        />

        <StatCard
          title="Storage"
          value={formatStorage(stats?.storageUsageBytes)}
          subValue="Prisma DB Files"
          trend={{ percentage: 5, isUp: true }}
          icon={<FiHardDrive className="w-5 h-5" />}
          iconBgColor="bg-rose-500/10 border-rose-500/20"
          iconTextColor="text-rose-400"
        />
      </div>

      {/* 2. Primary Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChart title="Daily Users Activity" data={dailyUsersData} lineColor="#818CF8" />
        <AreaChart title="Workspace Growth" data={workspaceGrowthData} color="#34D399" />
      </div>

      {/* 3. Secondary Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart title="AI Usage by Model" data={aiUsageData} barColor="bg-purple-500" />
        <DonutChart title="Storage Distribution (MB)" items={storageItems} />
      </div>
    </div>
  );
};
