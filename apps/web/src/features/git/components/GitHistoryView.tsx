import React, { useEffect } from 'react';
import { FiClock, FiGitCommit, FiUser } from 'react-icons/fi';
import { useGitStore } from '../store/git-store';

interface GitHistoryViewProps {
  workspaceId: string;
}

export const GitHistoryView: React.FC<GitHistoryViewProps> = ({ workspaceId }) => {
  const { commits, loadCommitHistory } = useGitStore();

  useEffect(() => {
    if (workspaceId) {
      void loadCommitHistory(workspaceId);
    }
  }, [workspaceId, loadCommitHistory]);

  return (
    <div className="p-3 border-t border-slate-800 space-y-2 select-none text-xs">
      <div className="flex items-center gap-1.5 text-slate-300 font-semibold px-1">
        <FiClock className="h-3.5 w-3.5 text-indigo-400" />
        <span>Commit History ({commits.length})</span>
      </div>

      {commits.length === 0 ? (
        <div className="text-[11px] text-slate-500 italic px-2 py-1">No commits yet</div>
      ) : (
        <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1.5">
          {commits.map((c) => (
            <div
              key={c.hash}
              className="p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1 font-sans"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                  <FiGitCommit className="h-3 w-3 inline mr-1" />
                  {c.hash}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(c.date).toLocaleDateString()}
                </span>
              </div>

              <p className="text-[11px] font-semibold text-slate-200 truncate">{c.message}</p>

              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <FiUser className="h-3 w-3 text-slate-500" />
                <span className="truncate">{c.author_name}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
