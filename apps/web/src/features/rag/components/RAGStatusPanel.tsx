import React, { useEffect } from 'react';
import {
  FiDatabase,
  FiFileText,
  FiLayers,
  FiUploadCloud,
  FiCheckCircle,
  FiAlertCircle,
} from 'react-icons/fi';
import { useRAGStore } from '../store/rag-store';
import { ProjectUploadModal } from './ProjectUploadModal';

interface RAGStatusPanelProps {
  workspaceId: string;
}

export const RAGStatusPanel: React.FC<RAGStatusPanelProps> = ({ workspaceId }) => {
  const { status, fetchRAGStatus, openUploadModal, useCodebaseContext, toggleCodebaseContext } =
    useRAGStore();

  useEffect(() => {
    if (workspaceId) {
      void fetchRAGStatus(workspaceId);
    }
  }, [workspaceId, fetchRAGStatus]);

  const isIndexed = status?.is_indexed ?? false;

  return (
    <div className="p-3 bg-slate-950/60 border-b border-slate-800 text-xs space-y-3 select-none">
      {/* Header & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <FiDatabase className="h-3.5 w-3.5 text-indigo-400" />
          <span>Codebase Vector RAG</span>
        </div>

        {/* Toggle Switch */}
        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-400 hover:text-slate-200">
          <span>RAG Context</span>
          <input
            type="checkbox"
            checked={useCodebaseContext}
            onChange={toggleCodebaseContext}
            className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
          />
        </label>
      </div>

      {/* RAG Status Cards */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <FiFileText className="h-4 w-4 text-emerald-400 shrink-0" />
          <div className="flex flex-col truncate">
            <span className="text-slate-500 font-mono text-[10px]">Indexed Files</span>
            <span className="font-bold text-slate-200">{status?.indexed_files ?? 0}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
          <FiLayers className="h-4 w-4 text-amber-400 shrink-0" />
          <div className="flex flex-col truncate">
            <span className="text-slate-500 font-mono text-[10px]">Total Chunks</span>
            <span className="font-bold text-slate-200">{status?.total_chunks ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Vector Store Status Badge & Trigger Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          {isIndexed ? (
            <div className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <FiCheckCircle className="h-3 w-3" />
              <span>ChromaDB Ready</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              <FiAlertCircle className="h-3 w-3" />
              <span>Not Indexed</span>
            </div>
          )}
        </div>

        <button
          onClick={openUploadModal}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-[11px] font-medium transition-all shadow-glow-sm"
        >
          <FiUploadCloud className="h-3.5 w-3.5" />
          <span>{isIndexed ? 'Re-Index' : 'Index Project'}</span>
        </button>
      </div>

      {/* Upload Modal Overlay */}
      <ProjectUploadModal workspaceId={workspaceId} />
    </div>
  );
};
