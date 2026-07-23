import React, { useEffect } from 'react';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiClock,
  FiCpu,
  FiHardDrive,
  FiRefreshCw,
  FiDatabase,
  FiServer,
  FiGlobe,
  FiLayers,
} from 'react-icons/fi';
import { useAdminStore } from '../store/admin-store';

// =============================================================================
// DevSync AI — Admin System Health Page
// Real-time status cards for Redis, Database (Supabase PostgreSQL), AI Service,
// Gateway API, and Frontend Vite app.
// =============================================================================

export const SystemHealthPage: React.FC = () => {
  const { health, isLoadingHealth, fetchSystemHealth } = useAdminStore();

  useEffect(() => {
    void fetchSystemHealth();
  }, [fetchSystemHealth]);

  const getServiceIcon = (name: string) => {
    switch (name) {
      case 'Database':
        return <FiDatabase className="w-5 h-5 text-emerald-400" />;
      case 'Redis':
        return <FiLayers className="w-5 h-5 text-rose-400" />;
      case 'AI Service':
        return <FiCpu className="w-5 h-5 text-purple-400" />;
      case 'Gateway':
        return <FiServer className="w-5 h-5 text-indigo-400" />;
      case 'Frontend':
      default:
        return <FiGlobe className="w-5 h-5 text-sky-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <FiCheckCircle className="w-3.5 h-3.5" />
            <span>Healthy</span>
          </span>
        );
      case 'degraded':
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
            <FiAlertTriangle className="w-3.5 h-3.5" />
            <span>Degraded</span>
          </span>
        );
      case 'down':
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30">
            <FiXCircle className="w-3.5 h-3.5" />
            <span>Down</span>
          </span>
        );
    }
  };

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header Refresh Row */}
      <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl shadow-xl">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Service Infrastructure Telemetry</h3>
          <p className="text-xs text-slate-400">
            Live health monitoring across monorepo microservices
          </p>
        </div>

        <button
          onClick={() => fetchSystemHealth()}
          disabled={isLoadingHealth}
          className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingHealth ? 'animate-spin' : ''}`} />
          <span>Check Now</span>
        </button>
      </div>

      {/* System Load Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 block">CPU Load</span>
            <span className="text-2xl font-bold text-slate-100">
              {health?.systemLoad.cpuPercent ?? 0}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <FiCpu className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 block">
              Memory Allocation
            </span>
            <span className="text-2xl font-bold text-slate-100">
              {health?.systemLoad.memoryPercent ?? 0}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <FiServer className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-slate-400 block">Disk Space</span>
            <span className="text-2xl font-bold text-slate-100">
              {health?.systemLoad.diskPercent ?? 0}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <FiHardDrive className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Monitored Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {health?.services.map((svc, idx) => (
          <div
            key={idx}
            className="bg-slate-900/90 border border-slate-800/80 p-5 rounded-2xl shadow-xl space-y-4 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  {getServiceIcon(svc.name)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-100">{svc.name}</h4>
                  <p className="text-[11px] text-slate-400">Infrastructure node</p>
                </div>
              </div>

              {getStatusBadge(svc.status)}
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 font-mono leading-relaxed">
              {svc.message}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-3">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Response Latency</span>
                <span className="font-mono font-bold text-indigo-400">
                  {svc.latencyMs >= 0 ? `${svc.latencyMs} ms` : 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Service Uptime</span>
                <span className="font-mono font-medium text-slate-300">
                  {formatUptime(svc.uptimeSeconds)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono pt-1">
              <FiClock className="w-3 h-3" />
              <span>Checked {new Date(svc.lastChecked).toLocaleTimeString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
