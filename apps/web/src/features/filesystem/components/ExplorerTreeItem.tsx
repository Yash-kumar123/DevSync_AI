import React, { useState } from 'react';
import { FiChevronRight, FiChevronDown } from 'react-icons/fi';
import type { TreeNode } from '../types/filesystem.types';
import { getFileIcon, getFolderIcon } from '../utils/file-icons';
import { useFileSystemStore } from '../store/filesystem-store';
import { useGitStore } from '../../git/store/git-store';
import { handleDragStart, handleDragOver, parseDragItem } from '../utils/drag-drop';

interface ExplorerTreeItemProps {
  node: TreeNode;
  level?: number;
}

export const ExplorerTreeItem: React.FC<ExplorerTreeItemProps> = ({ node, level = 0 }) => {
  const {
    activeFileId,
    expandedFolderIds,
    toggleFolderExpand,
    openFile,
    setContextMenu,
    renamingNodeId,
    renameFolder,
    renameFile,
    setRenamingNodeId,
    creatingNode,
    setCreatingNode,
    createFile,
    createFolder,
    moveNode,
    setSelectedFolder,
  } = useFileSystemStore();

  const { status: gitStatus } = useGitStore();

  const [renameValue, setRenameValue] = useState(node.name);
  const [createValue, setCreateValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const isExpanded = node.type === 'folder' && expandedFolderIds.has(node.id);
  const isRenaming = renamingNodeId === node.id;
  const isSelectedFile = node.type === 'file' && activeFileId === node.id;

  // Determine Git status badge for file
  const gitFileChange =
    node.type === 'file'
      ? gitStatus?.staged.find((f) => f.path.endsWith(node.name)) ||
        gitStatus?.unstaged.find((f) => f.path.endsWith(node.name))
      : null;

  const paddingLeft = `${level * 12 + 12}px`;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type === 'folder') {
      toggleFolderExpand(node.id);
      setSelectedFolder(node.id);
    } else {
      openFile(node.fileData);
      setSelectedFolder(node.folderId);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      type: node.type,
      targetId: node.id,
      parentId: node.type === 'folder' ? node.id : node.folderId,
    });
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameValue.trim() || renameValue === node.name) {
      setRenamingNodeId(null);
      return;
    }
    if (node.type === 'folder') {
      void renameFolder(node.id, renameValue.trim());
    } else {
      void renameFile(node.id, renameValue.trim());
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createValue.trim() || !creatingNode) {
      setCreatingNode(null);
      return;
    }
    if (creatingNode.type === 'file') {
      void createFile(createValue.trim(), node.id);
    } else {
      void createFolder(createValue.trim(), node.id);
    }
    setCreateValue('');
  };

  // Drag and Drop Handlers
  const onDragStart = (e: React.DragEvent) => {
    handleDragStart(e, { id: node.id, type: node.type, name: node.name });
  };

  const onDragOver = (e: React.DragEvent) => {
    if (node.type === 'folder') {
      handleDragOver(e);
      setIsDragOver(true);
    }
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (node.type !== 'folder') return;
    const item = parseDragItem(e);
    if (item) {
      void moveNode(item, node.id);
    }
  };

  return (
    <div className="select-none text-xs">
      {/* Node Row */}
      <div
        draggable
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ paddingLeft }}
        className={`group flex items-center justify-between py-1 px-2 cursor-pointer transition-colors border-l-2 ${
          isDragOver
            ? 'bg-indigo-900/40 border-indigo-400'
            : isSelectedFile
              ? 'bg-slate-800/90 text-indigo-300 font-medium border-indigo-500'
              : 'border-transparent text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {/* Chevron for folder */}
          {node.type === 'folder' ? (
            <span className="text-slate-500 group-hover:text-slate-300 transition-colors">
              {isExpanded ? (
                <FiChevronDown className="h-3.5 w-3.5" />
              ) : (
                <FiChevronRight className="h-3.5 w-3.5" />
              )}
            </span>
          ) : (
            <span className="w-3.5" />
          )}

          {/* Icon */}
          {node.type === 'folder' ? getFolderIcon(isExpanded) : getFileIcon(node.name)}

          {/* Name / Inline Rename Input */}
          {isRenaming ? (
            <form onSubmit={handleRenameSubmit} className="flex-1">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameSubmit}
                autoFocus
                className="w-full bg-slate-950 text-slate-100 px-1 py-0.5 rounded border border-indigo-500 focus:outline-none font-mono text-xs"
              />
            </form>
          ) : (
            <span className="truncate font-mono">{node.name}</span>
          )}
        </div>

        {/* Git Status Badge (M, A, D) */}
        {gitFileChange && (
          <span
            className={`font-mono text-[10px] font-bold px-1 rounded ${
              gitFileChange.status === 'M'
                ? 'text-amber-400 bg-amber-500/10'
                : gitFileChange.status === 'A'
                  ? 'text-emerald-400 bg-emerald-500/10'
                  : gitFileChange.status === 'D'
                    ? 'text-red-400 bg-red-500/10'
                    : 'text-cyan-400 bg-cyan-500/10'
            }`}
          >
            {gitFileChange.status}
          </span>
        )}
      </div>

      {/* Children Sub-tree (if expanded folder) */}
      {node.type === 'folder' && isExpanded && (
        <div>
          {/* Inline creation input inside this folder */}
          {creatingNode && creatingNode.parentId === node.id && (
            <div style={{ paddingLeft: `${(level + 1) * 12 + 12}px` }} className="py-1 px-2">
              <form onSubmit={handleCreateSubmit}>
                <input
                  type="text"
                  placeholder={creatingNode.type === 'file' ? 'filename.ts' : 'foldername'}
                  value={createValue}
                  onChange={(e) => setCreateValue(e.target.value)}
                  onBlur={handleCreateSubmit}
                  autoFocus
                  className="w-full bg-slate-950 text-slate-100 px-1 py-0.5 rounded border border-emerald-500 focus:outline-none font-mono text-xs"
                />
              </form>
            </div>
          )}

          {/* Render children */}
          {node.children.map((child) => (
            <ExplorerTreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
