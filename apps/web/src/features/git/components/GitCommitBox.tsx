import React, { useState } from 'react';
import { FiCheck, FiUpload, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { useGitStore } from '../store/git-store';

interface GitCommitBoxProps {
  workspaceId: string;
}

export const GitCommitBox: React.FC<GitCommitBoxProps> = ({ workspaceId }) => {
  const { status, commit, push, pull, fetchRemote } = useGitStore();
  const [message, setMessage] = useState('');

  const stagedCount = status?.staged.length || 0;

  const handleCommit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    void commit(workspaceId, message.trim());
    setMessage('');
  };

  return (
    <div className="p-3 border-b border-slate-800 bg-slate-900/60 space-y-2.5 select-none">
      {/* Commit message input */}
      <textarea
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Commit message... (Ctrl + Enter to commit)"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleCommit();
          }
        }}
        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none font-sans"
        id="git-commit-msg-input"
      />

      {/* Primary Commit Button */}
      <button
        onClick={() => handleCommit()}
        disabled={!message.trim()}
        className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
          message.trim()
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-sm'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
        id="git-commit-btn"
      >
        <FiCheck className="h-4 w-4" />
        <span>Commit ({stagedCount} staged)</span>
      </button>

      {/* Secondary Actions Bar (Push, Pull, Fetch) */}
      <div className="flex gap-2 text-xs font-medium pt-1">
        <button
          onClick={() => void push(workspaceId)}
          className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          title="Push to Remote"
          id="git-push-btn"
        >
          <FiUpload className="h-3.5 w-3.5 text-indigo-400" />
          <span>Push</span>
        </button>

        <button
          onClick={() => void pull(workspaceId)}
          className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          title="Pull from Remote"
          id="git-pull-btn"
        >
          <FiDownload className="h-3.5 w-3.5 text-emerald-400" />
          <span>Pull</span>
        </button>

        <button
          onClick={() => void fetchRemote(workspaceId)}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
          title="Fetch Remote Updates"
          id="git-fetch-btn"
        >
          <FiRefreshCw className="h-3.5 w-3.5 text-amber-400" />
          <span>Fetch</span>
        </button>
      </div>
    </div>
  );
};
