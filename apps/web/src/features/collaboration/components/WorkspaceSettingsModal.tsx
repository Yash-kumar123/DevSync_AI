import React, { useState } from 'react';
import {
  FiX,
  FiSettings,
  FiEdit,
  FiRefreshCw,
  FiTrash2,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCollaborationStore } from '../store/collaboration-store';
import { collaborationApi } from '../services/collaboration-api';

// =============================================================================
// DevSync AI — Workspace Settings Modal
// Allows Workspace Owners & Admins to rename workspace, transfer ownership,
// delete workspace, and inspect role permissions.
// =============================================================================

export const WorkspaceSettingsModal: React.FC = () => {
  const {
    currentWorkspaceId,
    currentUserRole,
    members,
    isSettingsModalOpen,
    setSettingsModalOpen,
    fetchMembers,
  } = useCollaborationStore();

  const [workspaceName, setWorkspaceName] = useState('');
  const [selectedNewOwner, setSelectedNewOwner] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isSettingsModalOpen) return null;

  const isOwner = currentUserRole === 'OWNER';
  const isAdmin = currentUserRole === 'ADMIN';

  const eligibleNewOwners = members.filter(
    (m) => m.role !== 'OWNER' && m.userId !== selectedNewOwner,
  );

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspaceId || !workspaceName.trim()) {
      toast.error('Workspace name cannot be empty');
      return;
    }

    setIsRenaming(true);
    try {
      await collaborationApi.renameWorkspace(currentWorkspaceId, workspaceName.trim());
      toast.success('Workspace renamed successfully');
      setWorkspaceName('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to rename workspace';
      toast.error(msg);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!currentWorkspaceId || !selectedNewOwner) {
      toast.error('Please select a member to transfer ownership');
      return;
    }

    const targetMember = members.find((m) => m.userId === selectedNewOwner);
    if (
      !confirm(
        `Are you sure you want to transfer workspace ownership to ${targetMember?.user.displayName}? You will become an Admin.`,
      )
    ) {
      return;
    }

    setIsTransferring(true);
    try {
      await collaborationApi.transferOwnership(currentWorkspaceId, selectedNewOwner);
      toast.success(`Ownership transferred to ${targetMember?.user.displayName}`);
      await fetchMembers(currentWorkspaceId);
      setSelectedNewOwner('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to transfer ownership';
      toast.error(msg);
    } finally {
      setIsTransferring(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspaceId) return;
    if (
      !confirm(
        'WARNING: This action is permanent and cannot be undone. All workspace files, folders, and settings will be deleted!',
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await collaborationApi.deleteWorkspace(currentWorkspaceId);
      toast.success('Workspace deleted successfully');
      setSettingsModalOpen(false);
      window.location.href = '/';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete workspace';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <FiSettings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Workspace Settings</h3>
              <p className="text-xs text-slate-400">Manage permissions & workspace controls</p>
            </div>
          </div>

          <button
            onClick={() => setSettingsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Section 1: Rename Workspace */}
          {(isOwner || isAdmin) && (
            <form
              onSubmit={handleRename}
              className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800"
            >
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FiEdit className="text-indigo-400" />
                <span>Rename Workspace</span>
              </h4>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New workspace name..."
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isRenaming}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow transition-all disabled:opacity-50"
                >
                  {isRenaming ? 'Saving...' : 'Rename'}
                </button>
              </div>
            </form>
          )}

          {/* Section 2: Transfer Ownership (Owner only) */}
          {isOwner && (
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FiRefreshCw className="text-amber-400" />
                <span>Transfer Workspace Ownership</span>
              </h4>
              <p className="text-xs text-slate-400">
                Select an active member to grant Owner privileges. You will be demoted to Admin.
              </p>

              <div className="flex gap-2">
                <select
                  value={selectedNewOwner}
                  onChange={(e) => setSelectedNewOwner(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="">-- Select New Owner --</option>
                  {eligibleNewOwners.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.displayName} ({m.user.email}) - {m.role}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleTransferOwnership}
                  disabled={isTransferring || !selectedNewOwner}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg shadow transition-all disabled:opacity-50"
                >
                  {isTransferring ? 'Transferring...' : 'Transfer'}
                </button>
              </div>
            </div>
          )}

          {/* Section 3: Workspace Role & Permissions Overview */}
          <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <FiShield className="text-purple-400" />
              <span>Permission Matrix</span>
            </h4>

            <div className="overflow-x-auto text-[11px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 px-2">Permission</th>
                    <th className="py-2 px-2 text-center">Owner</th>
                    <th className="py-2 px-2 text-center">Admin</th>
                    <th className="py-2 px-2 text-center">Editor</th>
                    <th className="py-2 px-2 text-center">Viewer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="py-2 px-2 font-medium">Read files & view workspace</td>
                    <td className="text-center py-2">
                      <FiCheckCircle className="inline text-emerald-400" />
                    </td>
                    <td className="text-center py-2">
                      <FiCheckCircle className="inline text-emerald-400" />
                    </td>
                    <td className="text-center py-2">
                      <FiCheckCircle className="inline text-emerald-400" />
                    </td>
                    <td className="text-center py-2">
                      <FiCheckCircle className="inline text-emerald-400" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-medium">Edit files & code sync</td>
                    <td className="text-center py-2">
                      <FiCheckCircle className="inline text-emerald-400" />
                    </td>
                    <td className="text-center py-2">
                      <FiCheckCircle className="inline text-emerald-400" />
                    </td>
                    <td className="text-center py-2">
                      <FiCheckCircle className="inline text-emerald-400" />
                    </td>
                    <td className="text-center py-2 text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-medium">Invite & manage members</td>
                    <td className="text-center py-2">
                      <FiCheckCircle className="inline text-emerald-400" />
                    </td>
                    <td className="text-center py-2">
                      <FiCheckCircle className="inline text-emerald-400" />
                    </td>
                    <td className="text-center py-2 text-slate-600">—</td>
                    <td className="text-center py-2 text-slate-600">—</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-2 font-medium">Transfer ownership & delete</td>
                    <td className="text-center py-2">
                      <FiCheckCircle className="inline text-emerald-400" />
                    </td>
                    <td className="text-center py-2 text-slate-600">—</td>
                    <td className="text-center py-2 text-slate-600">—</td>
                    <td className="text-center py-2 text-slate-600">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Danger Zone - Delete Workspace */}
          {isOwner && (
            <div className="space-y-3 bg-red-950/20 p-4 rounded-xl border border-red-500/30">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <FiAlertTriangle className="text-rose-400" />
                <span>Danger Zone</span>
              </h4>
              <p className="text-xs text-slate-300">
                Permanently delete this workspace and all associated files, folders, and member
                data.
              </p>

              <button
                onClick={handleDeleteWorkspace}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shadow transition-all active:scale-95 disabled:opacity-50"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting Workspace...' : 'Delete Workspace'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
