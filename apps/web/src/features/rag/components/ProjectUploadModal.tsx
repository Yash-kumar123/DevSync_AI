import React, { useState } from 'react';
import {
  FiUploadCloud,
  FiGitBranch,
  FiX,
  FiFileText,
  FiCheckCircle,
  FiLoader,
} from 'react-icons/fi';
import { useRAGStore } from '../store/rag-store';

interface ProjectUploadModalProps {
  workspaceId: string;
}

export const ProjectUploadModal: React.FC<ProjectUploadModalProps> = ({ workspaceId }) => {
  const {
    showUploadModal,
    closeUploadModal,
    uploadProjectZip,
    cloneGitRepo,
    isUploading,
    uploadProgress,
  } = useRAGStore();

  const [tab, setTab] = useState<'zip' | 'git'>('zip');
  const [gitUrl, setGitUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (!showUploadModal) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      void uploadProjectZip(workspaceId, selectedFile);
    }
  };

  const handleGitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (gitUrl.trim()) {
      void cloneGitRepo(workspaceId, gitUrl.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl p-6 relative flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <FiUploadCloud className="h-5 w-5 text-indigo-400" />
              <span>Index Project Codebase (RAG)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload project ZIP or clone Git repository to enable AI codebase retrieval.
            </p>
          </div>
          <button
            onClick={closeUploadModal}
            disabled={isUploading}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setTab('zip')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              tab === 'zip'
                ? 'bg-indigo-600 text-white shadow-glow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FiUploadCloud className="h-4 w-4" />
            <span>Upload ZIP Archive</span>
          </button>
          <button
            onClick={() => setTab('git')}
            className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
              tab === 'git'
                ? 'bg-indigo-600 text-white shadow-glow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FiGitBranch className="h-4 w-4" />
            <span>Clone Git Repository</span>
          </button>
        </div>

        {/* Tab Content */}
        {tab === 'zip' ? (
          <form onSubmit={handleZipSubmit} className="flex flex-col gap-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-colors ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
                id="zip-file-input"
              />

              <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-3">
                <FiFileText className="h-6 w-6 text-indigo-400" />
              </div>

              {selectedFile ? (
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                  <FiCheckCircle className="h-4 w-4" />
                  <span className="truncate max-w-[240px]">{selectedFile.name}</span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-300 font-semibold">
                    Drag and drop your project ZIP file here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 mb-3">
                    Supported extensions: .ts, .tsx, .js, .py, .java, .cpp, .go, .rs, .json, etc.
                  </p>
                  <label
                    htmlFor="zip-file-input"
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer transition-colors"
                  >
                    Browse ZIP File
                  </label>
                </>
              )}
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Indexing vectors in ChromaDB...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || isUploading}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all ${
                  selectedFile && !isUploading
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-glow-sm'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? <FiLoader className="h-4 w-4 animate-spin" /> : null}
                <span>Start Indexing</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleGitSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-300">Git Repository URL</label>
              <input
                type="url"
                placeholder="https://github.com/username/repository.git"
                value={gitUrl}
                onChange={(e) => setGitUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none font-mono"
              />
              <p className="text-[11px] text-slate-500">
                Provide a public GitHub or Git repository URL to clone and vectorize.
              </p>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-400">
                  <span>Cloning & Indexing in ChromaDB...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploading}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!gitUrl.trim() || isUploading}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white transition-all ${
                  gitUrl.trim() && !isUploading
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-glow-sm'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isUploading ? <FiLoader className="h-4 w-4 animate-spin" /> : null}
                <span>Clone & Index</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
