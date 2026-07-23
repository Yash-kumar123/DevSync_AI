import React, { useState } from 'react';
import { FiCode, FiChevronDown, FiChevronRight, FiCheckCircle } from 'react-icons/fi';
import { useRAGStore } from '../store/rag-store';

export const RAGRetrievedSourcesView: React.FC = () => {
  const { retrievedSources, confidenceScore, contextSizeBytes } = useRAGStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!retrievedSources || retrievedSources.length === 0) return null;

  const contextKb = (contextSizeBytes / 1024).toFixed(1);
  const scorePercent = Math.round(confidenceScore * 100);

  return (
    <div className="my-2 rounded-xl border border-indigo-500/30 bg-slate-950/80 overflow-hidden text-xs shadow-md">
      {/* Header Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-8 px-3 bg-indigo-500/10 border-b border-indigo-500/20 flex items-center justify-between text-indigo-300 font-semibold select-none hover:bg-indigo-500/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <FiChevronDown className="h-3.5 w-3.5" />
          ) : (
            <FiChevronRight className="h-3.5 w-3.5" />
          )}
          <FiCode className="h-3.5 w-3.5 text-indigo-400" />
          <span>Retrieved Codebase Context ({retrievedSources.length} sources)</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <FiCheckCircle className="h-3 w-3" />
            <span>{scorePercent}% Confidence</span>
          </span>
          <span className="text-slate-400">{contextKb} KB</span>
        </div>
      </button>

      {/* Expanded Sources List */}
      {isOpen && (
        <div className="p-3 space-y-2.5 max-h-60 overflow-y-auto custom-scrollbar">
          {retrievedSources.map((source, index) => (
            <div
              key={index}
              className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/90 font-mono text-[11px] space-y-1.5"
            >
              <div className="flex items-center justify-between text-indigo-400 font-semibold border-b border-slate-800 pb-1">
                <span className="truncate">{source.file_path}</span>
                <span className="text-[10px] text-slate-500">
                  Lines {source.start_line}-{source.end_line}
                </span>
              </div>
              <pre className="text-slate-300 overflow-x-auto custom-scrollbar leading-relaxed whitespace-pre-wrap">
                {source.code_snippet}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
