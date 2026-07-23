import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FiSave,
  FiSettings,
  FiLogOut,
  FiSidebar,
  FiSun,
  FiMoon,
  FiPlay,
  FiTerminal,
  FiUserPlus,
  FiDownload,
  FiMic,
  FiMicOff,
  FiX,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import { useAuth } from '@hooks/useAuth';
import { useIDEStore } from '../store/ide-store';
import { useTerminalStore } from '../../terminal/store/terminal-store';
import { useFileSystemStore } from '../../filesystem/store/filesystem-store';
import { socketClient } from '../../collaboration/services/socket-client';
import { OnlineUsersAvatars } from '../../collaboration/components/OnlineUsersAvatars';
import { ConnectionStatusBadge } from '../../collaboration/components/ConnectionStatusBadge';
import { Button } from '@components/ui/Button';

interface IDETopNavProps {
  roomCode?: string | undefined;
}

export const IDETopNav: React.FC<IDETopNavProps> = ({ roomCode = 'DEMO-ROOM' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { leftSidebarOpen, toggleLeftSidebar, editorSettings, updateEditorSettings } =
    useIDEStore();

  const { runCode, toggleBottomPanel, bottomPanelOpen } = useTerminalStore();
  const { files, activeFileId } = useFileSystemStore();

  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [hasCopiedLink, setHasCopiedLink] = useState(false);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  const inviteUrl = `${window.location.origin}/workspace/${roomCode}`;

  // Auto-connect socket and join room when IDE mounts
  useEffect(() => {
    if (user && roomCode) {
      void socketClient.joinRoom(roomCode, {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
      });
    }

    return () => {
      socketClient.leaveRoom();
    };
  }, [user, roomCode]);

  const handleCopyInviteLink = () => {
    void navigator.clipboard.writeText(inviteUrl);
    setHasCopiedLink(true);
    toast.success('Room Invite Link copied to clipboard!', { icon: '🔗', duration: 2500 });
    setTimeout(() => setHasCopiedLink(false), 3000);
  };

  const handleToggleVoiceChannel = async () => {
    if (isVoiceConnected) {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
        setMediaStream(null);
      }
      setIsVoiceConnected(false);
      toast('Voice channel disconnected', { icon: '🔇' });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaStream(stream);
        setIsVoiceConnected(true);
        toast.success('Connected to Voice Channel! Live mic active.', { icon: '🎙️' });
      } catch {
        toast.error('Could not access microphone for Voice Channel.');
      }
    }
  };

  const handleExportProjectFiles = () => {
    if (files.length === 0) {
      toast.error('No files to export in current workspace.');
      return;
    }

    // Export primary active file or bundle
    const activeFile = files.find((f) => f.id === activeFileId) || files[0];
    if (activeFile) {
      const blob = new Blob([activeFile.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = activeFile.fileName;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${activeFile.fileName}!`, { icon: '📦' });
    }
  };

  const handleSave = () => {
    const file = activeFileId ? files.find((f) => f.id === activeFileId) : null;
    const fileName = file ? file.fileName : 'File';
    toast.success(`Saved ${fileName}`, {
      icon: '💾',
      duration: 2000,
    });
  };

  const handleRunActiveCode = () => {
    const file = activeFileId ? files.find((f) => f.id === activeFileId) || null : null;
    if (!file) {
      toast.error('Please open a file to run code');
      return;
    }

    let ext = file.extension ? file.extension.replace(/^\./, '').toLowerCase() : '';
    if (!ext && file.fileName.includes('.')) {
      ext = file.fileName.split('.').pop()?.toLowerCase() || '';
    }

    let language = 'javascript';
    if (ext === 'py' || ext === 'python') language = 'python';
    else if (ext === 'ts' || ext === 'tsx' || ext === 'typescript') language = 'typescript';
    else if (ext === 'js' || ext === 'jsx' || ext === 'javascript') language = 'javascript';
    else if (ext === 'java') language = 'java';
    else if (ext === 'c') language = 'c';
    else if (ext === 'cpp' || ext === 'c++') language = 'cpp';
    else if (ext === 'go') language = 'go';

    void runCode({
      workspaceId: file.workspaceId || roomCode || 'default-workspace',
      fileName: file.fileName,
      language,
      code: file.content,
    });
  };

  const handleThemeToggle = () => {
    const nextTheme = editorSettings.theme === 'vs-dark' ? 'light' : 'vs-dark';
    updateEditorSettings({ theme: nextTheme });
    toast.success(`Theme switched to ${nextTheme === 'vs-dark' ? 'Dark' : 'Light'}`, {
      duration: 1500,
    });
  };

  return (
    <header className="h-12 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 flex items-center justify-between text-slate-300 select-none z-30">
      {/* Left section: Logo & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleLeftSidebar}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
            leftSidebarOpen ? 'bg-slate-800 text-indigo-400' : ''
          }`}
          title={leftSidebarOpen ? 'Collapse Explorer (Ctrl+B)' : 'Expand Explorer (Ctrl+B)'}
          id="ide-toggle-sidebar"
        >
          <FiSidebar className="h-4 w-4" />
        </button>

        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <img
            src="/devsync-icon.png"
            alt="DevSync AI Logo"
            className="h-7 w-7 object-contain rounded-md shadow-glow-sm"
          />
          <span className="font-bold text-sm tracking-tight text-white hidden sm:inline">
            DevSync AI
          </span>
        </div>

        {/* Workspace Room Name Badge */}
        <div className="flex items-center gap-1 sm:gap-1.5 rounded-md bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 text-[11px] sm:text-xs font-mono shrink-0">
          <span className="text-slate-400 hidden xs:inline">room:</span>
          <span className="font-semibold text-indigo-400 tracking-wider">
            {roomCode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Center section: Online Users Avatars & Connection Status (Visible on all screens) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <OnlineUsersAvatars />
        <div className="hidden sm:block">
          <ConnectionStatusBadge />
        </div>
      </div>

      {/* Right section: Action controls & Profile */}
      <div className="flex items-center gap-2">
        {/* Invite Teammate Button */}
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-sm transition-all"
          title="Invite Teammates & Share QR Code"
          id="ide-invite-btn"
        >
          <FiUserPlus className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Invite</span>
        </button>

        {/* Voice Channel Toggle */}
        <button
          onClick={() => void handleToggleVoiceChannel()}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
            isVoiceConnected
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title={isVoiceConnected ? 'Disconnect Voice Channel' : 'Connect Voice Channel (WebRTC)'}
          id="ide-voice-btn"
        >
          {isVoiceConnected ? (
            <FiMic className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <FiMicOff className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span className="hidden lg:inline">{isVoiceConnected ? 'Voice On' : 'Voice'}</span>
        </button>

        {/* Export Project Button */}
        <button
          onClick={handleExportProjectFiles}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Export Project File"
          id="ide-export-btn"
        >
          <FiDownload className="h-4 w-4" />
        </button>

        {/* Top Run Code Button */}
        <button
          onClick={handleRunActiveCode}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-sm transition-all"
          title="Run Code in Sandbox (Ctrl+Enter)"
          id="ide-top-run-btn"
        >
          <FiPlay className="h-3.5 w-3.5" />
          <span>Run</span>
        </button>

        {/* Terminal Toggle Button */}
        <button
          onClick={toggleBottomPanel}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            bottomPanelOpen
              ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Toggle Terminal Panel"
          id="ide-top-terminal-toggle"
        >
          <FiTerminal className="h-3.5 w-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Terminal</span>
        </button>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title="Save file (Ctrl+S)"
          id="ide-save-btn"
        >
          <FiSave className="h-3.5 w-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Save</span>
        </button>

        {/* Quick Theme Toggle */}
        <button
          onClick={handleThemeToggle}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title={`Switch to ${editorSettings.theme === 'vs-dark' ? 'Light' : 'Dark'} theme`}
          id="ide-theme-toggle"
        >
          {editorSettings.theme === 'vs-dark' ? (
            <FiSun className="h-4 w-4 text-amber-400" />
          ) : (
            <FiMoon className="h-4 w-4 text-indigo-400" />
          )}
        </button>

        {/* Settings Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
            className={`p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
              showSettingsDropdown ? 'bg-slate-800 text-slate-200' : ''
            }`}
            title="Editor Settings"
            id="ide-settings-btn"
          >
            <FiSettings className="h-4 w-4" />
          </button>

          {/* Quick Settings Dropdown */}
          {showSettingsDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-3 z-50 text-xs flex flex-col gap-3">
              <div className="font-semibold text-slate-200 pb-2 border-b border-slate-800 flex justify-between items-center">
                <span>Editor Preferences</span>
                <span className="text-[10px] text-indigo-400 uppercase font-mono">VS Code</span>
              </div>

              {/* Minimap toggle */}
              <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                <span>Minimap</span>
                <input
                  type="checkbox"
                  checked={editorSettings.minimap}
                  onChange={(e) => updateEditorSettings({ minimap: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
              </label>

              {/* Word wrap toggle */}
              <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                <span>Word Wrap</span>
                <input
                  type="checkbox"
                  checked={editorSettings.wordWrap === 'on'}
                  onChange={(e) =>
                    updateEditorSettings({ wordWrap: e.target.checked ? 'on' : 'off' })
                  }
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
              </label>

              {/* Read Only toggle */}
              <label className="flex items-center justify-between cursor-pointer text-slate-300 hover:text-white">
                <span>Read-Only Mode</span>
                <input
                  type="checkbox"
                  checked={editorSettings.readOnly}
                  onChange={(e) => updateEditorSettings({ readOnly: e.target.checked })}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
              </label>

              {/* Font Size controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-300">Font Size ({editorSettings.fontSize}px)</span>
                <div className="flex gap-1">
                  <button
                    onClick={() =>
                      updateEditorSettings({ fontSize: Math.max(10, editorSettings.fontSize - 1) })
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                  >
                    -
                  </button>
                  <button
                    onClick={() =>
                      updateEditorSettings({ fontSize: Math.min(24, editorSettings.fontSize + 1) })
                    }
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile info & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-xs font-semibold text-slate-200 leading-tight">
              {user?.displayName ?? 'Developer'}
            </span>
            <span className="text-[10px] text-slate-500">@{user?.username ?? 'user'}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => void logout()}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800"
            id="ide-logout-btn"
            title="Logout"
          >
            <FiLogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Invite Teammate & QR Code Share Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl flex flex-col gap-4 text-slate-200 animate-in fade-in zoom-in-95 duration-150 relative">
            <button
              onClick={() => setIsInviteModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              <FiX className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <FiUserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Invite Teammates</h3>
                <p className="text-xs text-slate-400">Share room link or scan QR code to join</p>
              </div>
            </div>

            {/* Room Code Badge */}
            <div className="flex flex-col gap-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Room Code</span>
              <span className="text-base font-mono font-bold text-indigo-400 tracking-wider">
                {roomCode.toUpperCase()}
              </span>
            </div>

            {/* Copyable Shareable Link */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-slate-300">Direct Join URL</span>
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="bg-transparent text-xs text-slate-300 font-mono flex-1 outline-none truncate"
                />
                <button
                  onClick={handleCopyInviteLink}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1 shrink-0 transition-all shadow-glow-sm"
                >
                  {hasCopiedLink ? (
                    <FiCheck className="h-3.5 w-3.5" />
                  ) : (
                    <FiCopy className="h-3.5 w-3.5" />
                  )}
                  <span>{hasCopiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* QR Code Display for Instant Mobile Scan */}
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 font-medium">Scan to join on Mobile</span>
              <div className="p-2.5 bg-white rounded-xl shadow-md border border-slate-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
                    inviteUrl,
                  )}`}
                  alt="Room Join QR Code"
                  className="h-28 w-28 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
