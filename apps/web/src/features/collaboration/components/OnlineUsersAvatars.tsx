import React from 'react';
import { useCollaborationStore } from '../store/collaboration-store';

export const OnlineUsersAvatars: React.FC = () => {
  const { users } = useCollaborationStore();

  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5" id="online-users-avatars">
      <div className="flex -space-x-2 overflow-hidden">
        {users.slice(0, 5).map((user) => {
          const initials = user.displayName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

          return (
            <div
              key={user.socketId}
              className="relative group cursor-pointer"
              title={`${user.displayName} (@${user.username})${user.isTyping ? ' - Typing...' : ''}`}
            >
              {/* User Avatar Circle with assigned color border */}
              <div
                style={{ borderColor: user.color }}
                className="h-7 w-7 rounded-full bg-slate-800 border-2 flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-900"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.displayName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>

              {/* Typing Dot Indicator */}
              {user.isTyping && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
                </span>
              )}
            </div>
          );
        })}
      </div>

      {users.length > 5 && (
        <span className="text-[10px] font-semibold font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-700">
          +{users.length - 5}
        </span>
      )}
    </div>
  );
};
