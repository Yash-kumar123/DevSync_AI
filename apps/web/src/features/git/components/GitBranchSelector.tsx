import React, { useState } from 'react';
import { FiGitBranch, FiPlus, FiCheck, FiTrash2 } from 'react-icons/fi';
import { useGitStore } from '../store/git-store';

interface GitBranchSelectorProps {
  workspaceId: string;
}

export const GitBranchSelector: React.FC<GitBranchSelectorProps> = ({ workspaceId }) => {
  const { status, branches, checkoutBranch, createBranch, deleteBranch } = useGitStore();
  const [isOpen, setIsOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [showCreateInput, setShowCreateInput] = useState(false);

  const currentBranch = status?.currentBranch || 'main';

  const handleCreateBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBranchName.trim()) {
      void createBranch(workspaceId, newBranchName.trim());
      setNewBranchName('');
      setShowCreateInput(false);
    }
  };

  return (
    <div className="relative p-3 border-b border-slate-800 bg-slate-950/60 select-none text-xs">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 font-mono font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          id="git-branch-selector-btn"
        >
          <FiGitBranch className="h-4 w-4 text-indigo-400" />
          <span>{currentBranch}</span>
        </button>

        <button
          onClick={() => setShowCreateInput(!showCreateInput)}
          className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Create New Branch"
          id="git-create-branch-btn"
        >
          <FiPlus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Create Branch Input */}
      {showCreateInput && (
        <form onSubmit={handleCreateBranch} className="mt-2.5 flex gap-1.5">
          <input
            type="text"
            placeholder="New branch name..."
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 px-2.5 py-1 rounded-lg focus:outline-none font-mono"
            autoFocus
          />
          <button
            type="submit"
            disabled={!newBranchName.trim()}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            Create
          </button>
        </form>
      )}

      {/* Branch Dropdown */}
      {isOpen && (
        <div className="absolute left-3 right-3 top-10 mt-1 z-40 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl p-2 space-y-1">
          <div className="text-[10px] font-mono text-slate-500 uppercase px-2 py-1 border-b border-slate-800">
            Select Git Branch
          </div>
          <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-0.5">
            {branches.map((b) => (
              <div
                key={b.name}
                onClick={() => {
                  if (!b.current) void checkoutBranch(workspaceId, b.name);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg cursor-pointer font-mono text-xs ${
                  b.current
                    ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  {b.current && <FiCheck className="h-3.5 w-3.5 text-indigo-400" />}
                  <span className="truncate">{b.name}</span>
                </div>
                {!b.current && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      void deleteBranch(workspaceId, b.name);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800"
                    title="Delete Branch"
                  >
                    <FiTrash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
