import React, { useState } from 'react';
import {
  FiBell,
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiInfo,
  FiUserCheck,
  FiShield,
  FiCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCollaborationStore } from '../store/collaboration-store';
import { collaborationApi } from '../services/collaboration-api';

// =============================================================================
// DevSync AI — Notification Center
// Popover / Dropdown center displaying pending workspace invitations with Accept/Decline
// actions, role change notifications, and workspace activity alerts.
// =============================================================================

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const {
    notifications,
    pendingInvitations,
    markNotificationRead,
    markAllNotificationsRead,
    fetchPendingInvitations,
    fetchMembers,
    currentWorkspaceId,
  } = useCollaborationStore();

  const unreadCount = notifications.filter((n) => !n.read).length + pendingInvitations.length;

  const handleRespondInvitation = async (token: string, accept: boolean) => {
    setProcessingId(token);
    try {
      const res = await collaborationApi.respondToInvitation(token, accept);
      toast.success(res.message);
      await fetchPendingInvitations();
      if (currentWorkspaceId) {
        await fetchMembers(currentWorkspaceId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action failed';
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'INVITATION':
        return <FiMail className="w-4 h-4 text-indigo-400" />;
      case 'ROLE_CHANGE':
        return <FiShield className="w-4 h-4 text-amber-400" />;
      case 'MEMBER_JOIN':
      case 'MEMBER_LEAVE':
        return <FiUserCheck className="w-4 h-4 text-emerald-400" />;
      case 'WORKSPACE_EVENT':
      default:
        return <FiInfo className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="relative inline-block text-left">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
        title="Notifications"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl z-50 overflow-hidden text-slate-200 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-850">
            <div className="flex items-center gap-2">
              <FiBell className="w-4 h-4 text-indigo-400" />
              <h4 className="font-semibold text-sm text-slate-100">Notifications</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>

            {notifications.some((n) => !n.read) && (
              <button
                onClick={() => markAllNotificationsRead()}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                <FiCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Body List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar">
            {/* Pending Invitations Section */}
            {pendingInvitations.length > 0 && (
              <div className="bg-indigo-950/20 p-3">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">
                  Pending Invitations ({pendingInvitations.length})
                </span>
                <div className="space-y-2">
                  {pendingInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-3 bg-slate-900 border border-indigo-500/30 rounded-xl shadow-sm"
                    >
                      <div className="flex items-start gap-2">
                        <FiMail className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-100">
                            Invite to {inv.workspaceName || 'Workspace'}
                          </p>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            From{' '}
                            <span className="text-white font-medium">
                              {inv.inviter?.displayName || 'Owner'}
                            </span>{' '}
                            as <span className="text-indigo-400 font-semibold">{inv.role}</span>.
                          </p>

                          <div className="flex items-center gap-2 mt-2.5">
                            <button
                              disabled={processingId === inv.token}
                              onClick={() => handleRespondInvitation(inv.token, true)}
                              className="flex-1 flex items-center justify-center gap-1 py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold rounded-lg shadow transition-all"
                            >
                              <FiCheckCircle className="w-3 h-3" />
                              <span>Accept</span>
                            </button>
                            <button
                              disabled={processingId === inv.token}
                              onClick={() => handleRespondInvitation(inv.token, false)}
                              className="flex-1 flex items-center justify-center gap-1 py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg border border-slate-700 transition-all"
                            >
                              <FiXCircle className="w-3 h-3" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Feed */}
            {notifications.length === 0 && pendingInvitations.length === 0 ? (
              <div className="py-10 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
                <FiBell className="w-8 h-8 opacity-30 text-slate-400" />
                <span>No notifications yet</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && markNotificationRead(notification.id)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-800/60 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-slate-800/30' : 'opacity-75'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h5 className="text-xs font-semibold text-slate-100 truncate">
                        {notification.title}
                      </h5>
                      {!notification.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      {notification.message}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {new Date(notification.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
