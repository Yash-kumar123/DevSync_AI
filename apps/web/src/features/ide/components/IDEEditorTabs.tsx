import React from 'react';
import { FiX } from 'react-icons/fi';
import { useFileSystemStore } from '../../filesystem/store/filesystem-store';
import { getFileIcon } from '../../filesystem/utils/file-icons';
import { useIDEStore } from '../store/ide-store';

export const IDEEditorTabs: React.FC = () => {
  const { openFiles, activeFileId, setActiveFile, closeFile, unsavedFileIds } =
    useFileSystemStore();
  const {
    openFileIds: legacyOpenIds,
    activeFileId: legacyActiveId,
    setActiveFile: setLegacyActive,
    closeFile: closeLegacy,
  } = useIDEStore();

  // Prefer dynamic filesystem store tabs if open, else fallback to static IDE store tabs
  const hasDynamicFiles = openFiles.length > 0;

  if (!hasDynamicFiles && legacyOpenIds.length === 0) return null;

  if (hasDynamicFiles) {
    return (
      <div className="h-9 border-b border-slate-800 bg-slate-950/80 flex items-center overflow-x-auto custom-scrollbar select-none">
        {openFiles.map((file) => {
          const isActive = activeFileId === file.id;
          const isUnsaved = unsavedFileIds.has(file.id);

          return (
            <div
              key={file.id}
              onClick={() => setActiveFile(file.id)}
              className={`group h-full px-3.5 flex items-center gap-2 border-r border-slate-800 text-xs font-mono cursor-pointer transition-colors shrink-0 max-w-[200px] relative ${
                isActive
                  ? 'bg-slate-900 text-slate-100 font-medium border-t-2 border-t-indigo-500'
                  : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
              }`}
              id={`tab-${file.id}`}
            >
              {getFileIcon(file.fileName)}
              <span className="truncate">{file.fileName}</span>

              {/* Unsaved changes dot indicator */}
              {isUnsaved ? (
                <span
                  className="h-2 w-2 rounded-full bg-indigo-400 group-hover:hidden"
                  title="Unsaved changes"
                />
              ) : null}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.id);
                }}
                className={`p-0.5 rounded hover:bg-slate-800 hover:text-slate-200 text-slate-500 transition-opacity ml-1 ${
                  isUnsaved ? 'hidden group-hover:block' : 'opacity-70 group-hover:opacity-100'
                }`}
                title="Close Tab"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback static tabs
  return (
    <div className="h-9 border-b border-slate-800 bg-slate-950/80 flex items-center overflow-x-auto custom-scrollbar select-none">
      {legacyOpenIds.map((fileId) => {
        const isActive = legacyActiveId === fileId;
        const fileName = fileId.split('/').pop() || fileId;

        return (
          <div
            key={fileId}
            onClick={() => setLegacyActive(fileId)}
            className={`group h-full px-3.5 flex items-center gap-2 border-r border-slate-800 text-xs font-mono cursor-pointer transition-colors shrink-0 max-w-[200px] relative ${
              isActive
                ? 'bg-slate-900 text-slate-100 font-medium border-t-2 border-t-indigo-500'
                : 'text-slate-400 hover:bg-slate-900/50 hover:text-slate-200'
            }`}
            id={`tab-${fileId.replace(/[/.]/g, '-')}`}
          >
            {getFileIcon(fileName)}
            <span className="truncate">{fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeLegacy(fileId);
              }}
              className="p-0.5 rounded hover:bg-slate-800 hover:text-slate-200 text-slate-500 opacity-70 group-hover:opacity-100 transition-opacity ml-1"
              title="Close Tab"
            >
              <FiX className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
