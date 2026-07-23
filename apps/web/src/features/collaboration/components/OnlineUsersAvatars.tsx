import React, { useState, useRef, useEffect } from 'react';
import { useCollaborationStore } from '../store/collaboration-store';
import { useAuthStore } from '../../../store/auth-store';
import { FiUsers, FiX } from 'react-icons/fi';

export const OnlineUsersAvatars: React.FC = () => {
  const { users, onlineUsers } = useCollaborationStore();
  const currentUser = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Combine both users and onlineUsers arrays, deduplicated by userId or socketId
  const combinedList = [
    ...users,
    ...onlineUsers.map((u) => ({
      socketId: u.socketId,
      userId: u.userId,
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      color: u.color,
      isOnline: true,
      isTyping: u.isTyping,
    })),
  ];

  const uniqueUserMap = new Map<string, (typeof combinedList)[0]>();
  combinedList.forEach((u) => {
    const key = u.userId || u.socketId || u.username || u.displayName;
    if (key && !uniqueUserMap.has(key)) {
      uniqueUserMap.set(key, u);
    }
  });

  const activeUserList = Array.from(uniqueUserMap.values());
  if (activeUserList.length === 0 && currentUser) {
    activeUserList.push({
      socketId: 'current-user-socket',
      userId: currentUser.id,
      username: currentUser.username,
      displayName: currentUser.displayName,
      avatarUrl: currentUser.avatarUrl,
      color: '#6366f1',
      isOnline: true,
      isTyping: false,
    });
  }

  const count = activeUserList.length;

  return (
    <div
      className="relative inline-flex items-center"
      ref={dropdownRef}
      id="online-users-container"
    >
      {/* Trigger Button showing avatars & user count badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all text-xs text-slate-200 select-none group focus:outline-none focus:ring-1 focus:ring-indigo-500"
        title="View members currently in this room"
        id="online-users-avatars"
      >
        <div className="flex -space-x-2 overflow-hidden items-center">
          {activeUserList.slice(0, 4).map((user, idx) => {
            const initials = (user.displayName || user.username || 'U')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={user.socketId || user.userId || idx}
                style={{ borderColor: user.color || '#6366f1' }}
                className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-slate-900 border flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-1 ring-slate-950"
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
            );
          })}
        </div>

        <div className="flex items-center gap-1">
          <FiUsers className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold text-xs text-emerald-400">
            {count} {count === 1 ? 'Joined' : 'Joined'}
          </span>
        </div>
      </button>

      {/* Popover / Modal displaying names and details of joined people */}
      {isOpen && (
        <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-2 w-72 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-3 z-50 text-xs flex flex-col gap-2.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Joined Members ({count})</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {activeUserList.map((user, idx) => {
              const isSelf =
                currentUser &&
                (user.userId === currentUser.id || user.displayName === currentUser.displayName);
              const initials = (user.displayName || user.username || 'U')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={user.socketId || user.userId || idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      style={{ borderColor: user.color || '#6366f1' }}
                      className="relative h-7 w-7 rounded-full bg-slate-900 border-2 shrink-0 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
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
                      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-slate-900" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-slate-200 truncate max-w-[120px]">
                          {user.displayName}
                        </span>
                        {isSelf && (
                          <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 rounded font-mono">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 truncate">
                        @{user.username || 'user'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {user.isTyping && (
                      <span className="text-[10px] text-amber-400 animate-pulse font-mono">
                        typing...
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
