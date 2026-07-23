import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { FiUsers, FiCopy, FiMessageSquare, FiSend } from 'react-icons/fi';
import { useCollaborationStore } from '../store/collaboration-store';
import { useAuthStore } from '../../../store/auth-store';
import { socketClient } from '../services/socket-client';
import { ConnectionStatusBadge } from './ConnectionStatusBadge';

interface ChatMessage {
  id: string;
  message: string;
  user: { id: string; displayName: string; username?: string; avatarUrl?: string };
  timestamp: string;
}

export const CollaborationPanelContent: React.FC = () => {
  const { currentRoom, currentWorkspaceId, users } = useCollaborationStore();
  const currentUser = useAuthStore((state) => state.user);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeRoomId = currentWorkspaceId || currentRoom || 'DEMO-ROOM';

  // Listen for real-time incoming chat messages
  useEffect(() => {
    const unsubscribe = socketClient.onChatMessage((msg) => {
      setChatMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Auto scroll chat to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCopyRoomCode = () => {
    const codeToCopy = currentRoom || currentWorkspaceId || 'DEMO-ROOM';
    void navigator.clipboard.writeText(codeToCopy);
    toast.success('Room code copied to clipboard!', { duration: 2000 });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !currentUser) return;

    const msgText = inputMessage.trim();
    setInputMessage('');

    socketClient.emitChatMessage(activeRoomId, msgText, {
      id: currentUser.id,
      displayName: currentUser.displayName,
      username: currentUser.username,
      ...(currentUser.avatarUrl ? { avatarUrl: currentUser.avatarUrl } : {}),
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full text-slate-200 select-none overflow-hidden bg-slate-900/40">
      {/* Scrollable upper section: Room info & Members roster */}
      <div className="p-3.5 flex flex-col gap-3 overflow-y-auto shrink-0 max-h-48 border-b border-slate-800/80">
        {/* Room Overview Card */}
        <div className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Active Room
            </span>
            <ConnectionStatusBadge />
          </div>

          <div className="flex items-center justify-between gap-2 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800 font-mono">
            <span className="text-xs font-bold text-indigo-400 tracking-wider truncate">
              {currentRoom || currentWorkspaceId || 'DEMO-ROOM'}
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

        {/* Online Members Roster */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <FiUsers className="h-3.5 w-3.5 text-indigo-400" />
              <span>Online Members ({users.length > 0 ? users.length : 1})</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            {(users.length > 0
              ? users
              : currentUser
                ? [
                    {
                      socketId: 'me',
                      userId: currentUser.id,
                      username: currentUser.username,
                      displayName: currentUser.displayName,
                      avatarUrl: currentUser.avatarUrl,
                      color: '#6366f1',
                      isOnline: true,
                      isTyping: false,
                      cursor: null,
                    },
                  ]
                : []
            ).map((user, idx) => {
              const initials = (user.displayName || user.username || 'U')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              return (
                <div
                  key={user.socketId || idx}
                  className="p-1.5 px-2.5 rounded-lg border border-slate-800/80 bg-slate-900/60 flex items-center justify-between transition-colors hover:border-slate-700"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      style={{ borderColor: user.color || '#6366f1' }}
                      className="h-6 w-6 rounded-full bg-slate-800 border flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-sm"
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

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {user.displayName}
                        </span>
                        {user.isTyping && (
                          <span className="px-1 py-0.5 text-[8px] font-bold rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse">
                            typing...
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-Time Live Communication Chat Section */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-950/50">
        {/* Chat Section Header */}
        <div className="px-3.5 py-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900/80">
          <FiMessageSquare className="h-4 w-4 text-indigo-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Team Communication Chat
          </span>
        </div>

        {/* Chat Messages Feed */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5">
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-4">
              <FiMessageSquare className="h-8 w-8 text-slate-700 mb-2" />
              <p className="text-xs font-semibold text-slate-400">Workspace Chat</p>
              <p className="text-[11px] text-slate-500 max-w-[200px] mt-1">
                Communicate live with team members joined in this room.
              </p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isSelf = currentUser && msg.user.id === currentUser.id;
              const timeStr = new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 px-1">
                    <span className="font-semibold text-slate-300">
                      {isSelf ? 'You' : msg.user.displayName}
                    </span>
                    <span>•</span>
                    <span className="font-mono">{timeStr}</span>
                  </div>

                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      isSelf
                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Form */}
        <form
          onSubmit={handleSendMessage}
          className="p-2 border-t border-slate-800 bg-slate-900/90 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Type a message to team..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 bg-slate-950 text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-700/70 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-all shadow-glow-sm shrink-0"
            title="Send Message"
          >
            <FiSend className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
