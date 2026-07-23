import React, { useEffect, useRef } from 'react';
import { FiFilePlus, FiFolderPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useFileSystemStore } from '../store/filesystem-store';

export const ExplorerContextMenu: React.FC = () => {
  const menuRef = useRef<HTMLDivElement>(null);
  const {
    contextMenu,
    closeContextMenu,
    setCreatingNode,
    setRenamingNodeId,
    deleteFolder,
    deleteFile,
  } = useFileSystemStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeContextMenu();
      }
    };
    if (contextMenu.isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.isOpen, closeContextMenu]);

  if (!contextMenu.isOpen) return null;

  const handleNewFile = () => {
    closeContextMenu();
    const parentId = contextMenu.type === 'folder' ? contextMenu.targetId : contextMenu.parentId;
    setCreatingNode({ type: 'file', parentId });
  };

  const handleNewFolder = () => {
    closeContextMenu();
    const parentId = contextMenu.type === 'folder' ? contextMenu.targetId : contextMenu.parentId;
    setCreatingNode({ type: 'folder', parentId });
  };

  const handleRename = () => {
    closeContextMenu();
    if (contextMenu.targetId) {
      setRenamingNodeId(contextMenu.targetId);
    }
  };

  const handleDelete = () => {
    closeContextMenu();
    if (!contextMenu.targetId) return;
    if (contextMenu.type === 'folder') {
      void deleteFolder(contextMenu.targetId);
    } else if (contextMenu.type === 'file') {
      void deleteFile(contextMenu.targetId);
    }
  };

  return (
    <div
      ref={menuRef}
      style={{ top: contextMenu.y, left: contextMenu.x }}
      className="fixed z-50 w-48 rounded-lg border border-slate-800 bg-slate-900/95 backdrop-blur-md shadow-2xl p-1.5 text-xs text-slate-300 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <button
        onClick={handleNewFile}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-indigo-600 hover:text-white transition-colors"
      >
        <FiFilePlus className="h-3.5 w-3.5" />
        <span>New File</span>
      </button>

      <button
        onClick={handleNewFolder}
        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-indigo-600 hover:text-white transition-colors"
      >
        <FiFolderPlus className="h-3.5 w-3.5" />
        <span>New Folder</span>
      </button>

      {contextMenu.type !== 'root' && (
        <>
          <div className="my-1 border-t border-slate-800" />
          <button
            onClick={handleRename}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-indigo-600 hover:text-white transition-colors"
          >
            <FiEdit2 className="h-3.5 w-3.5" />
            <span>Rename</span>
          </button>

          <button
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-red-600/80 hover:text-white text-red-400 transition-colors"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </>
      )}
    </div>
  );
};
