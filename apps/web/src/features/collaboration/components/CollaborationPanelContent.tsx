import React from 'react';
import toast from 'react-hot-toast';
import { FiUsers, FiCopy } from 'react-icons/fi';
import { useCollaborationStore } from '../store/collaboration-store';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';

export const CollaborationPanelContent: React.FC = () => {
  const { currentRoom, users } = useCollaborationStore();

  const handleCopyRoomCode = () => {
    if (currentRoom) {
      void navigator.clipboard.writeText(currentRoom);
      toast.success('Room code copied to clipboard!', { duration: 2000 });
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 text-slate-200 select-none overflow-y-auto">
      {/* Room Overview Card */}
      <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Active Room
          </span>
          <ConnectionStatusBadge />
        </div>

        <div className="flex items-center justify-between gap-2 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800 font-mono">
          <span className="text-sm font-bold text-indigo-400 tracking-wider">
            {currentRoom ?? 'DEMO-ROOM'}
          </span>
          <button
            onClick={handleCopyRoomCode}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Copy Room Code"
          >
            <FiCopy className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Online Users Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
          <FiUsers className="h-3.5 w-3.5 text-indigo-400" />
          <span>Online Members ({users.length})</span>
        </div>
      </div>

      {/* User Roster List */}
      <div className="flex flex-col gap-2">
        {users.map((user) => {
          const initials = user.displayName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={user.socketId}
              className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 flex items-center justify-between transition-colors hover:border-slate-700"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Avatar with assigned color pill */}
                <div
                  style={{ borderColor: user.color }}
                  className="h-8 w-8 rounded-full bg-slate-800 border-2 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                >
                  {initials}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {user.displayName}
                    </span>
                    {user.isTyping && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
                        typing...
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-0.5">
                    <span>@{user.username}</span>
                    {user.cursor && (
                      <span className="text-indigo-400 font-semibold">
                        Ln {user.cursor.lineNumber}, Col {user.cursor.column}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Unique Color Indicator Dot */}
              <div
                style={{ backgroundColor: user.color }}
                className="h-2.5 w-2.5 rounded-full shrink-0 shadow-sm"
                title={`Color: ${user.color}`}
              />
            </div>
          );
        })}

        {users.length === 0 && (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            No connected users in room.
          </div>
        )}
      </div>
    </div>
  );
};
