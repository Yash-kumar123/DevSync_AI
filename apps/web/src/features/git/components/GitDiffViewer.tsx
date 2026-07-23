import React from 'react';
import { FiX, FiFileText } from 'react-icons/fi';
import { useGitStore } from '../store/git-store';

export const GitDiffViewer: React.FC = () => {
  const { activeDiff, showDiffModal, closeDiffModal } = useGitStore();

  if (!showDiffModal || !activeDiff) return null;

  const lines = activeDiff.diff.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-4xl h-[75vh] rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-10 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold">
            <FiFileText className="h-4 w-4 text-indigo-400" />
            <span>Git Diff: {activeDiff.filePath}</span>
          </div>

          <button
            onClick={closeDiffModal}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Diff View Canvas */}
        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed bg-[#090d16] text-slate-300 custom-scrollbar select-text">
          {lines.length === 0 || !activeDiff.diff.trim() ? (
            <div className="text-slate-500 italic">No diff changes detected.</div>
          ) : (
            lines.map((line, idx) => {
              if (line.startsWith('+') && !line.startsWith('+++')) {
                return (
                  <div
                    key={idx}
                    className="bg-emerald-500/10 text-emerald-300 px-2 py-0.5 border-l-2 border-emerald-500"
                  >
                    {line}
                  </div>
                );
              }
              if (line.startsWith('-') && !line.startsWith('---')) {
                return (
                  <div
                    key={idx}
                    className="bg-red-500/10 text-red-300 px-2 py-0.5 border-l-2 border-red-500"
                  >
                    {line}
                  </div>
                );
              }
              if (line.startsWith('@@')) {
                return (
                  <div
                    key={idx}
                    className="text-indigo-400 font-semibold py-1 bg-indigo-500/10 px-2"
                  >
                    {line}
                  </div>
                );
              }
              return (
                <div key={idx} className="px-2 py-0.5 text-slate-400">
                  {line}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
