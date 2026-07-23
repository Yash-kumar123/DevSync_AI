import React, { useEffect } from 'react';
import { FiClock, FiGitCommit } from 'react-icons/fi';
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
      <div className="flex items-center justify-between text-slate-300 font-semibold px-1">
        <div className="flex items-center gap-1.5">
          <FiClock className="h-3.5 w-3.5 text-indigo-400" />
          <span>Git Branch Timeline</span>
        </div>
        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
          {commits.length} commits
        </span>
      </div>

      {commits.length === 0 ? (
        <div className="text-[11px] text-slate-500 italic px-2 py-3 border border-dashed border-slate-800 rounded-xl text-center">
          No commits recorded in git history
        </div>
      ) : (
        <div className="max-h-56 overflow-y-auto custom-scrollbar relative pl-3 space-y-3 border-l-2 border-indigo-500/40 ml-2 py-1">
          {commits.map((c, idx) => {
            const initials = (c.author_name || 'Git')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div key={c.hash} className="relative group pl-3">
                {/* Timeline Graph Node Circle */}
                <div
                  className={`absolute -left-[19px] top-1 h-3 w-3 rounded-full border-2 bg-slate-900 transition-all group-hover:scale-125 ${
                    idx === 0
                      ? 'border-emerald-400 bg-emerald-500 ring-2 ring-emerald-500/40'
                      : 'border-indigo-400 bg-slate-900'
                  }`}
                />

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition-all space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/30 shrink-0">
                      <FiGitCommit className="h-3 w-3 inline mr-1" />
                      {c.hash.slice(0, 7)}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate">
                      {new Date(c.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">
                    {c.message}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <div className="h-4 w-4 rounded-full bg-indigo-600 text-white font-bold text-[8px] flex items-center justify-center">
                        {initials}
                      </div>
                      <span className="truncate max-w-[120px] font-medium">{c.author_name}</span>
                    </div>

                    {idx === 0 && (
                      <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        HEAD
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
