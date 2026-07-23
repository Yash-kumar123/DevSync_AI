import React, { useState } from 'react';
import { FiX, FiMail, FiShield, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCollaborationStore } from '../store/collaboration-store';
import { collaborationApi } from '../services/collaboration-api';
import type { WorkspaceRole } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Invite Member Modal
// Dialog window allowing workspace Owners & Admins to invite new collaborators
// by specifying target email address and workspace role.
// =============================================================================

export const InviteMemberModal: React.FC = () => {
  const { currentWorkspaceId, currentUserRole, isInviteModalOpen, setInviteModalOpen } =
    useCollaborationStore();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>('EDITOR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isInviteModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspaceId || !email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await collaborationApi.inviteMember(currentWorkspaceId, email.trim(), role);
      toast.success(res.message || `Invitation sent to ${email}`);
      setEmail('');
      setInviteModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send invitation';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <FiSend className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Invite Collaborator</h3>
              <p className="text-xs text-slate-400">Add a new member to this workspace</p>
            </div>
          </div>

          <button
            onClick={() => setInviteModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              User Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Role Selection Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Workspace Role
            </label>
            <div className="relative">
              <FiShield className="absolute left-3.5 top-3 text-slate-500 w-4 h-4" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer transition-all"
              >
                {currentUserRole === 'OWNER' && (
                  <option value="ADMIN">Admin — Full member management & file editing</option>
                )}
                <option value="EDITOR">Editor — Can view, create & edit source code</option>
                <option value="VIEWER">Viewer — Read-only access to files & workspace</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setInviteModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FiSend className="w-3.5 h-3.5" />
              )}
              <span>Send Invitation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
