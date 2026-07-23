import React, { useEffect, useState } from 'react';
import {
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiList,
  FiInfo,
  FiAlertTriangle,
  FiXCircle,
  FiCode,
} from 'react-icons/fi';
import { useAdminStore } from '../store/admin-store';
import type { LogLevel, LogService } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Admin Logs Viewer Page
// Audit stream viewer for system logs with live search, service filters,
// level filters (INFO, WARN, ERROR, DEBUG), metadata inspection, and pagination.
// =============================================================================

export const LogsPage: React.FC = () => {
  const {
    logs,
    logsTotal,
    logsPage,
    logsTotalPages,
    logsSearch,
    logsServiceFilter,
    logsLevelFilter,
    isLoadingLogs,
    fetchLogs,
    setLogsSearch,
    setLogsServiceFilter,
    setLogsLevelFilter,
    setLogsPage,
  } = useAdminStore();

  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    void fetchLogs();
  }, [fetchLogs]);

  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'ERROR':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-rose-500/20 text-rose-300 border-rose-500/40 uppercase">
            <FiXCircle className="w-3 h-3" />
            <span>ERROR</span>
          </span>
        );
      case 'WARN':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-500/20 text-amber-300 border-amber-500/40 uppercase">
            <FiAlertTriangle className="w-3 h-3" />
            <span>WARN</span>
          </span>
        );
      case 'DEBUG':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-purple-500/20 text-purple-300 border-purple-500/40 uppercase">
            <FiCode className="w-3 h-3" />
            <span>DEBUG</span>
          </span>
        );
      case 'INFO':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border bg-sky-500/20 text-sky-300 border-sky-500/40 uppercase">
            <FiInfo className="w-3 h-3" />
            <span>INFO</span>
          </span>
        );
    }
  };

  const formatTimestamp = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}`;
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl shadow-xl">
        {/* Search Field */}
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search log messages..."
            value={logsSearch}
            onChange={(e) => setLogsSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300">
            <FiFilter className="text-indigo-400" />
            <select
              value={logsServiceFilter}
              onChange={(e) => setLogsServiceFilter(e.target.value as LogService | 'ALL')}
              className="bg-transparent text-xs text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">
                All Services
              </option>
              <option value="AUTHENTICATION" className="bg-slate-900">
                Authentication
              </option>
              <option value="WORKSPACE" className="bg-slate-900">
                Workspace
              </option>
              <option value="AI" className="bg-slate-900">
                AI Service
              </option>
              <option value="TERMINAL" className="bg-slate-900">
                Terminal
              </option>
              <option value="GATEWAY" className="bg-slate-900">
                Gateway
              </option>
              <option value="ERROR" className="bg-slate-900">
                Error
              </option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300">
            <select
              value={logsLevelFilter}
              onChange={(e) => setLogsLevelFilter(e.target.value as LogLevel | 'ALL')}
              className="bg-transparent text-xs text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">
                All Levels
              </option>
              <option value="INFO" className="bg-slate-900">
                INFO
              </option>
              <option value="WARN" className="bg-slate-900">
                WARN
              </option>
              <option value="ERROR" className="bg-slate-900">
                ERROR
              </option>
              <option value="DEBUG" className="bg-slate-900">
                DEBUG
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/60 font-sans">
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Service</th>
                <th className="py-3.5 px-4 font-semibold">Level</th>
                <th className="py-3.5 px-4 font-semibold">Message</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {isLoadingLogs ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 font-sans">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading system log stream...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 font-sans">
                    No logs matching search and filter criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedLogId === log.id;

                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                          {formatTimestamp(log.timestamp)}
                        </td>

                        <td className="py-3 px-4 font-sans font-medium text-indigo-300">
                          {log.service}
                        </td>

                        <td className="py-3 px-4 font-sans">{getLevelBadge(log.level)}</td>

                        <td className="py-3 px-4 text-slate-100 font-medium leading-relaxed">
                          {log.message}
                        </td>
                      </tr>

                      {/* Expandable Metadata Row */}
                      {isExpanded && log.metadata && (
                        <tr className="bg-slate-950/80">
                          <td colSpan={4} className="p-4">
                            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                              <span className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-wider block mb-1">
                                Log Payload Metadata
                              </span>
                              <pre className="text-[11px] text-emerald-400 overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 font-sans">
          <div className="flex items-center gap-2">
            <FiList className="w-4 h-4 text-indigo-400" />
            <span>
              Total <strong className="text-slate-200">{logsTotal}</strong> log entries
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={logsPage <= 1}
              onClick={() => setLogsPage(logsPage - 1)}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              {logsPage} / {logsTotalPages || 1}
            </span>
            <button
              disabled={logsPage >= logsTotalPages}
              onClick={() => setLogsPage(logsPage + 1)}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
