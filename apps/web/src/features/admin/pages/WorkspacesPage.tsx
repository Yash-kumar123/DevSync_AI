import React, { useEffect } from 'react';
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiFolder,
  FiUsers,
  FiCheckCircle,
} from 'react-icons/fi';
import { useAdminStore } from '../store/admin-store';

// =============================================================================
// DevSync AI — Admin Workspace Management Page
// Table displaying workspace name, room code, owner, member count, creation date,
// active status, search filters, and pagination.
// =============================================================================

export const WorkspacesPage: React.FC = () => {
  const {
    workspaces,
    workspacesTotal,
    workspacesPage,
    workspacesTotalPages,
    workspacesSearch,
    isLoadingWorkspaces,
    fetchWorkspaces,
    setWorkspacesSearch,
    setWorkspacesPage,
  } = useAdminStore();

  useEffect(() => {
    void fetchWorkspaces();
  }, [fetchWorkspaces]);

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    return new Date(isoString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/80 p-4 rounded-2xl shadow-xl">
        <div className="relative flex-1 w-full">
          <FiSearch className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search workspaces by name or room code..."
            value={workspacesSearch}
            onChange={(e) => setWorkspacesSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Workspaces Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/60">
                <th className="py-3.5 px-4 font-semibold">Workspace</th>
                <th className="py-3.5 px-4 font-semibold">Room Code</th>
                <th className="py-3.5 px-4 font-semibold">Owner</th>
                <th className="py-3.5 px-4 font-semibold">Members</th>
                <th className="py-3.5 px-4 font-semibold">Created Date</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {isLoadingWorkspaces ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading workspaces data...</span>
                  </td>
                </tr>
              ) : workspaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No workspaces matching criteria.
                  </td>
                </tr>
              ) : (
                workspaces.map((ws) => (
                  <tr key={ws.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <FiFolder className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-slate-100">{ws.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-indigo-400 font-mono font-semibold">
                      {ws.roomCode}
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-slate-200">{ws.owner.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{ws.owner.email}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                        <FiUsers className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ws.membersCount}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {formatDate(ws.createdDate)}
                    </td>

                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-emerald-400 font-medium">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40">
          <span>
            Total <strong className="text-slate-200">{workspacesTotal}</strong> active workspaces
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={workspacesPage <= 1}
              onClick={() => setWorkspacesPage(workspacesPage - 1)}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              {workspacesPage} / {workspacesTotalPages || 1}
            </span>
            <button
              disabled={workspacesPage >= workspacesTotalPages}
              onClick={() => setWorkspacesPage(workspacesPage + 1)}
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
