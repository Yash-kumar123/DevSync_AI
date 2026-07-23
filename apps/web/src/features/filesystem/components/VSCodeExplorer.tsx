import React, { useEffect, useState } from 'react';
import { FiFilePlus, FiFolderPlus, FiMinusSquare, FiRefreshCw, FiFolder } from 'react-icons/fi';
import { useFileSystemStore } from '../store/filesystem-store';
import { socketClient } from '../../collaboration/services/socket-client';
import { ExplorerTreeItem } from './ExplorerTreeItem';
import { ExplorerContextMenu } from './ExplorerContextMenu';

interface VSCodeExplorerProps {
  workspaceId: string;
  workspaceName?: string | undefined;
}

export const VSCodeExplorer: React.FC<VSCodeExplorerProps> = ({
  workspaceId,
  workspaceName = 'PROJECT EXPLORER',
}) => {
  const {
    tree,
    files,
    isLoading,
    fetchWorkspaceFileSystem,
    setCreatingNode,
    creatingNode,
    createFile,
    createFolder,
    collapseAllFolders,
    setContextMenu,
    selectedFolderId,
  } = useFileSystemStore();

  const [rootCreateValue, setRootCreateValue] = useState('');

  useEffect(() => {
    if (workspaceId) {
      void fetchWorkspaceFileSystem(workspaceId);
    }

    // Automatically sync workspace file tree when peers create, edit, or delete files
    const unsubscribe = socketClient.onFileChanged(() => {
      if (workspaceId) {
        void fetchWorkspaceFileSystem(workspaceId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [workspaceId, fetchWorkspaceFileSystem]);

  const handleNewFile = () => {
    setCreatingNode({ type: 'file', parentId: selectedFolderId });
  };

  const handleNewFolder = () => {
    setCreatingNode({ type: 'folder', parentId: selectedFolderId });
  };

  const handleRootCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rootCreateValue.trim() || !creatingNode) {
      setCreatingNode(null);
      return;
    }
    if (creatingNode.type === 'file') {
      void createFile(rootCreateValue.trim(), null);
    } else {
      void createFolder(rootCreateValue.trim(), null);
    }
    setRootCreateValue('');
  };

  const handleContextMenuRoot = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type: 'root',
      targetId: null,
      parentId: null,
    });
  };

  return (
    <div
      onContextMenu={handleContextMenuRoot}
      className="h-full flex flex-col bg-slate-900/90 text-slate-300 select-none overflow-hidden relative"
      id="vscode-project-explorer"
    >
      {/* Explorer Toolbar Header */}
      <div className="h-9 px-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
          {workspaceName}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handleNewFile}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="New File"
            id="explorer-new-file-btn"
          >
            <FiFilePlus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleNewFolder}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="New Folder"
            id="explorer-new-folder-btn"
          >
            <FiFolderPlus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={collapseAllFolders}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Collapse All Folders"
            id="explorer-collapse-all-btn"
          >
            <FiMinusSquare className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => void fetchWorkspaceFileSystem(workspaceId)}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            title="Refresh Explorer"
            id="explorer-refresh-btn"
          >
            <FiRefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tree Content Area */}
      <div className="flex-1 overflow-y-auto py-2">
        {/* Root inline creation prompt */}
        {creatingNode && creatingNode.parentId === null && (
          <div className="px-3 py-1">
            <form onSubmit={handleRootCreateSubmit}>
              <input
                type="text"
                placeholder={creatingNode.type === 'file' ? 'filename.ts' : 'foldername'}
                value={rootCreateValue}
                onChange={(e) => setRootCreateValue(e.target.value)}
                onBlur={handleRootCreateSubmit}
                autoFocus
                className="w-full bg-slate-950 text-slate-100 px-1 py-0.5 rounded border border-indigo-500 focus:outline-none font-mono text-xs"
              />
            </form>
          </div>
        )}

        {/* Tree Item List */}
        {tree.length > 0 ? (
          tree.map((node) => <ExplorerTreeItem key={node.id} node={node} />)
        ) : files.length === 0 && !isLoading ? (
          /* VS Code Empty Workspace State */
          <div className="p-4 flex flex-col items-center justify-center text-center text-slate-500 h-64">
            <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center mb-3">
              <FiFolder className="h-6 w-6 text-indigo-400" />
            </div>
            <h4 className="text-xs font-semibold text-slate-300 mb-1">No Files in Workspace</h4>
            <p className="text-[11px] text-slate-500 mb-4 max-w-[180px]">
              Create files or folders to start building your project.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[160px]">
              <button
                onClick={handleNewFile}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-sm transition-all"
              >
                <FiFilePlus className="h-3.5 w-3.5" />
                <span>New File</span>
              </button>
              <button
                onClick={handleNewFolder}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                <FiFolderPlus className="h-3.5 w-3.5" />
                <span>New Folder</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Floating Context Menu Overlay */}
      <ExplorerContextMenu />
    </div>
  );
};
