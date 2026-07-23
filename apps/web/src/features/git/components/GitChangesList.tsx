import React from 'react';
import { FiPlus, FiMinus, FiRotateCcw, FiEye, FiCheckCircle, FiFileText } from 'react-icons/fi';
import { useGitStore } from '../store/git-store';
import type { GitFileStatus } from '../types/git.types';

interface GitChangesListProps {
  workspaceId: string;
}

export const GitChangesList: React.FC<GitChangesListProps> = ({ workspaceId }) => {
  const { status, stageFile, unstageFile, stageAll, unstageAll, discardChanges, loadDiff } =
    useGitStore();

  const staged = status?.staged || [];
  const unstaged = status?.unstaged || [];

  const getStatusBadge = (statusChar: GitFileStatus) => {
    switch (statusChar) {
      case 'M':
        return <span className="font-mono text-[10px] font-bold text-amber-400">M</span>;
      case 'A':
        return <span className="font-mono text-[10px] font-bold text-emerald-400">A</span>;
      case 'D':
        return <span className="font-mono text-[10px] font-bold text-red-400">D</span>;
      case '?':
      case 'U':
        return <span className="font-mono text-[10px] font-bold text-cyan-400">?</span>;
      default:
        return <span className="font-mono text-[10px] font-bold text-slate-400">M</span>;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4 select-none text-xs">
      {/* Staged Changes Section */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-slate-400 font-semibold px-1">
          <div className="flex items-center gap-1.5">
            <FiCheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Staged Changes ({staged.length})</span>
          </div>

          {staged.length > 0 && (
            <button
              onClick={() => void unstageAll(workspaceId)}
              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition-colors"
              title="Unstage All Changes"
            >
              <FiMinus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {staged.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic px-2 py-1">No staged changes</div>
        ) : (
          <div className="space-y-0.5">
            {staged.map((f) => (
              <div
                key={f.path}
                className="group flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-2 truncate font-mono text-[11px] text-slate-300">
                  {getStatusBadge(f.status)}
                  <span className="truncate">{f.path}</span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => void loadDiff(workspaceId, f.path)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400"
                    title="View Diff"
                  >
                    <FiEye className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => void unstageFile(workspaceId, f.path)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400"
                    title="Unstage File"
                  >
                    <FiMinus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unstaged Changes Section */}
      <div className="space-y-1.5 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-slate-400 font-semibold px-1">
          <div className="flex items-center gap-1.5">
            <FiFileText className="h-3.5 w-3.5 text-amber-400" />
            <span>Changes ({unstaged.length})</span>
          </div>

          {unstaged.length > 0 && (
            <button
              onClick={() => void stageAll(workspaceId)}
              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-200 transition-colors"
              title="Stage All Changes"
            >
              <FiPlus className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {unstaged.length === 0 ? (
          <div className="text-[11px] text-slate-500 italic px-2 py-1">Working tree clean</div>
        ) : (
          <div className="space-y-0.5">
            {unstaged.map((f) => (
              <div
                key={f.path}
                className="group flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-2 truncate font-mono text-[11px] text-slate-300">
                  {getStatusBadge(f.status)}
                  <span className="truncate">{f.path}</span>
                </div>

                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => void loadDiff(workspaceId, f.path)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400"
                    title="View Diff"
                  >
                    <FiEye className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => void discardChanges(workspaceId, f.path)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400"
                    title="Discard Changes"
                  >
                    <FiRotateCcw className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => void stageFile(workspaceId, f.path)}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400"
                    title="Stage File"
                  >
                    <FiPlus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
