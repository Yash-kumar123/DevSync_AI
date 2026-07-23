import React, { useState } from 'react';
import { FiUserPlus, FiShield, FiTrash2, FiChevronDown, FiClock, FiEdit3 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCollaborationStore } from '../store/collaboration-store';
import { useAuthStore } from '../../../store/auth-store';
import { collaborationApi } from '../services/collaboration-api';
import type { WorkspaceRole } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Workspace Members Panel
// Sidebar component displaying member avatars, usernames, roles, presence badges,
// green online status, last active timestamps, typing indicators, and management actions.
// =============================================================================

export const WorkspaceMembersPanel: React.FC = () => {
  const {
    currentWorkspaceId,
    currentUserRole,
    members,
    onlineUsers,
    typingUsers,
    isLoadingMembers,
    setInviteModalOpen,
    updateMemberRoleInStore,
    removeMemberFromStore,
  } = useCollaborationStore();

  const currentUser = useAuthStore((s) => s.user);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const canManageMembers = currentUserRole === 'OWNER' || currentUserRole === 'ADMIN';

  const formatLastActive = (isoString?: string) => {
    if (!isoString) return 'Offline';
    const date = new Date(isoString);
    const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffSeconds < 30) return 'Active now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };

  const getRoleBadgeStyle = (role: WorkspaceRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'ADMIN':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'EDITOR':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'VIEWER':
      default:
        return 'bg-slate-700/40 text-slate-400 border-slate-600/40';
    }
  };

  const handleRoleChange = async (targetUserId: string, newRole: WorkspaceRole) => {
    if (!currentWorkspaceId) return;
    setUpdatingUserId(targetUserId);
    try {
      await collaborationApi.updateMemberRole(currentWorkspaceId, targetUserId, newRole);
      updateMemberRoleInStore(targetUserId, newRole);
      toast.success(`Updated role to ${newRole}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update role';
      toast.error(msg);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRemoveMember = async (targetUserId: string, displayName: string) => {
    if (!currentWorkspaceId) return;
    if (!confirm(`Are you sure you want to remove ${displayName} from the workspace?`)) return;

    setUpdatingUserId(targetUserId);
    try {
      await collaborationApi.removeMember(currentWorkspaceId, targetUserId);
      removeMemberFromStore(targetUserId);
      toast.success(`Removed ${displayName} from workspace`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to remove member';
      toast.error(msg);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200 select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiShield className="text-indigo-400 w-5 h-5" />
          <h3 className="font-semibold text-sm text-slate-100 tracking-wide">Workspace Members</h3>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium">
            {members.length}
          </span>
        </div>

        {canManageMembers && (
          <button
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow border border-indigo-400/30 transition-all active:scale-95"
            title="Invite new member"
          >
            <FiUserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {isLoadingMembers ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-xs gap-2">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading members...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">No members found.</div>
        ) : (
          members.map((member) => {
            const isOnline = onlineUsers.some((u) => u.userId === member.userId);
            const presenceUser = onlineUsers.find((u) => u.userId === member.userId);
            const isTyping = typingUsers[member.userId] || presenceUser?.isTyping || false;
            const isSelf = currentUser?.id === member.userId;

            return (
              <div
                key={member.id}
                className="group relative flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 border border-slate-800/60 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* User Avatar & Online Indicator */}
                  <div className="relative flex-shrink-0">
                    {member.user.avatarUrl ? (
                      <img
                        src={member.user.avatarUrl}
                        alt={member.user.displayName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600/30 text-indigo-300 font-semibold text-xs flex items-center justify-center border border-indigo-500/30">
                        {member.user.displayName.slice(0, 2).toUpperCase()}
                      </div>
                    )}

                    {/* Green online indicator */}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 transition-colors ${
                        isOnline ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
                      }`}
                      title={isOnline ? 'Online' : 'Offline'}
                    />
                  </div>

                  {/* Username & Metadata */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-xs text-slate-100 truncate">
                        {member.user.displayName}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded">
                          you
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      {/* Typing indicator */}
                      {isTyping ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium animate-pulse">
                          <FiEdit3 className="w-3 h-3" />
                          <span>typing...</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-slate-400">
                          <FiClock className="w-3 h-3" />
                          <span>{formatLastActive(presenceUser?.lastActive)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role Badge & Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {canManageMembers && !isSelf && member.role !== 'OWNER' ? (
                    <div className="relative group/role">
                      <select
                        disabled={updatingUserId === member.userId}
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.userId, e.target.value as WorkspaceRole)
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-md border appearance-none cursor-pointer bg-slate-900 hover:bg-slate-800 pr-5 ${getRoleBadgeStyle(
                          member.role,
                        )} focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                      >
                        {currentUserRole === 'OWNER' && <option value="ADMIN">ADMIN</option>}
                        <option value="EDITOR">EDITOR</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                      <FiChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
                    </div>
                  ) : (
                    <span
                      className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded border uppercase ${getRoleBadgeStyle(
                        member.role,
                      )}`}
                    >
                      {member.role}
                    </span>
                  )}

                  {/* Remove Button */}
                  {canManageMembers && !isSelf && member.role !== 'OWNER' && (
                    <button
                      disabled={updatingUserId === member.userId}
                      onClick={() => handleRemoveMember(member.userId, member.user.displayName)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove member"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
