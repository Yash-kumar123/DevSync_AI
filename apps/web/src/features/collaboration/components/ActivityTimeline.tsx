import React, { useEffect } from 'react';
import {
  FiActivity,
  FiUserPlus,
  FiUserMinus,
  FiFilePlus,
  FiEdit,
  FiTrash2,
  FiFolderPlus,
  FiRefreshCw,
  FiShield,
  FiClock,
} from 'react-icons/fi';
import { useCollaborationStore } from '../store/collaboration-store';
import type { ActivityAction } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Activity Timeline
// Displays real-time timeline feed of workspace actions (User joined/left,
// File created/renamed/deleted, Workspace created, Role changes).
// =============================================================================

export const ActivityTimeline: React.FC = () => {
  const { currentWorkspaceId, activities, isLoadingActivities, fetchActivities } =
    useCollaborationStore();

  useEffect(() => {
    if (currentWorkspaceId) {
      void fetchActivities(currentWorkspaceId);
    }
  }, [currentWorkspaceId, fetchActivities]);

  const getActivityIcon = (action: ActivityAction) => {
    switch (action) {
      case 'USER_JOINED':
        return <FiUserPlus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'USER_LEFT':
      case 'MEMBER_REMOVED':
        return <FiUserMinus className="w-3.5 h-3.5 text-rose-400" />;
      case 'FILE_CREATED':
        return <FiFilePlus className="w-3.5 h-3.5 text-indigo-400" />;
      case 'FILE_RENAMED':
        return <FiEdit className="w-3.5 h-3.5 text-amber-400" />;
      case 'FILE_DELETED':
        return <FiTrash2 className="w-3.5 h-3.5 text-red-400" />;
      case 'WORKSPACE_CREATED':
      case 'WORKSPACE_RENAMED':
        return <FiFolderPlus className="w-3.5 h-3.5 text-sky-400" />;
      case 'ROLE_UPDATED':
      case 'OWNERSHIP_TRANSFERRED':
        return <FiShield className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <FiActivity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200 select-none">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiActivity className="text-emerald-400 w-5 h-5" />
          <h3 className="font-semibold text-sm text-slate-100 tracking-wide">Activity Log</h3>
        </div>

        <button
          onClick={() => currentWorkspaceId && fetchActivities(currentWorkspaceId)}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Refresh timeline"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${isLoadingActivities ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {isLoadingActivities ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-xs gap-2">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span>Loading timeline...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs flex flex-col items-center gap-2">
            <FiClock className="w-8 h-8 opacity-30 text-slate-400" />
            <span>No activity recorded yet</span>
          </div>
        ) : (
          <div className="relative border-l border-slate-800 pl-4 space-y-4 ml-2">
            {activities.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[23px] top-0.5 p-1 rounded-full bg-slate-900 border border-slate-700">
                  {getActivityIcon(item.action)}
                </div>

                <div className="bg-slate-800/40 hover:bg-slate-800/80 p-3 rounded-xl border border-slate-800 transition-all">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-medium text-slate-300">
                      {item.user?.displayName || 'System'}
                    </span>
                    <span>{formatTimestamp(item.createdAt)}</span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium mt-1 leading-snug">
                    {item.details || item.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
