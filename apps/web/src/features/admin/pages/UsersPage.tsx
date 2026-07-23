import React, { useEffect } from 'react';
import {
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';
import { useAdminStore } from '../store/admin-store';

// =============================================================================
// DevSync AI — Admin Users Management Page
// Table displaying user avatars, names, emails, roles, last login timestamps,
// statuses, with live search, role filters, and pagination controls.
// =============================================================================

export const UsersPage: React.FC = () => {
  const {
    users,
    usersTotal,
    usersPage,
    usersTotalPages,
    usersSearch,
    usersRoleFilter,
    isLoadingUsers,
    fetchUsers,
    setUsersSearch,
    setUsersRoleFilter,
    setUsersPage,
  } = useAdminStore();

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ADMIN':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'MEMBER':
      case 'EDITOR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'VIEWER':
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Never';
    return new Date(isoString).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            placeholder="Search users by name, email, or username..."
            value={usersSearch}
            onChange={(e) => setUsersSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300">
            <FiFilter className="text-indigo-400" />
            <select
              value={usersRoleFilter}
              onChange={(e) => setUsersRoleFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-100 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">
                All Roles
              </option>
              <option value="OWNER" className="bg-slate-900">
                Owner
              </option>
              <option value="ADMIN" className="bg-slate-900">
                Admin
              </option>
              <option value="MEMBER" className="bg-slate-900">
                Member
              </option>
              <option value="VIEWER" className="bg-slate-900">
                Viewer
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider bg-slate-950/60">
                <th className="py-3.5 px-4 font-semibold">User</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Role</th>
                <th className="py-3.5 px-4 font-semibold">Last Login</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {isLoadingUsers ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading users data...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-300 font-bold flex items-center justify-center border border-indigo-500/30">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-semibold text-slate-100">{user.name}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono">{user.email}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRoleBadgeStyle(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {formatDate(user.lastLogin)}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {user.status === 'active' ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-500">
                            <FiXCircle className="w-3.5 h-3.5" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </div>
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
            Total <strong className="text-slate-200">{usersTotal}</strong> registered users
          </span>

          <div className="flex items-center gap-2">
            <button
              disabled={usersPage <= 1}
              onClick={() => setUsersPage(usersPage - 1)}
              className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-200">
              {usersPage} / {usersTotalPages || 1}
            </span>
            <button
              disabled={usersPage >= usersTotalPages}
              onClick={() => setUsersPage(usersPage + 1)}
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
