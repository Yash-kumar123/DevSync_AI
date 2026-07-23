import React from 'react';
import {
  FiChevronRight,
  FiChevronDown,
  FiFolder,
  FiFolderMinus,
  FiFileText,
  FiCode,
  FiFile,
  FiGlobe,
} from 'react-icons/fi';
import type { FileNode } from '../types/ide.types';
import { useIDEStore } from '../store/ide-store';

interface IDEFileTreeItemProps {
  node: FileNode;
  depth?: number;
}

/** Get file icon based on file extension. */
function getFileIcon(name: string) {
  if (name.endsWith('.tsx') || name.endsWith('.ts')) {
    return <FiCode className="h-3.5 w-3.5 text-sky-400 shrink-0" />;
  }
  if (name.endsWith('.json')) {
    return <FiFileText className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
  }
  if (name.endsWith('.css')) {
    return <FiGlobe className="h-3.5 w-3.5 text-pink-400 shrink-0" />;
  }
  if (name.endsWith('.md')) {
    return <FiFileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />;
  }
  return <FiFile className="h-3.5 w-3.5 text-slate-400 shrink-0" />;
}

export const IDEFileTreeItem: React.FC<IDEFileTreeItemProps> = ({ node, depth = 0 }) => {
  const { activeFileId, openFile, expandedFolderIds, toggleFolder } = useIDEStore();

  const isExpanded = expandedFolderIds.has(node.path);
  const isActive = activeFileId === node.path;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.isFolder) {
      toggleFolder(node.path);
    } else {
      openFile(node.path);
    }
  };

  const paddingLeft = depth * 12 + 12;

  return (
    <div>
      {/* Node Row */}
      <div
        onClick={handleClick}
        style={{ paddingLeft: `${paddingLeft}px` }}
        className={`flex items-center gap-1.5 py-1 pr-3 text-xs font-mono cursor-pointer transition-colors select-none ${
          isActive
            ? 'bg-slate-800 text-indigo-300 font-semibold border-l-2 border-indigo-500'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
        }`}
        id={`explorer-item-${node.path.replace(/[/.]/g, '-')}`}
      >
        {node.isFolder ? (
          <>
            <span className="text-slate-500 hover:text-slate-300 shrink-0">
              {isExpanded ? (
                <FiChevronDown className="h-3.5 w-3.5" />
              ) : (
                <FiChevronRight className="h-3.5 w-3.5" />
              )}
            </span>
            {isExpanded ? (
              <FiFolderMinus className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            ) : (
              <FiFolder className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5 shrink-0" /> {/* Spacer for alignment */}
            {getFileIcon(node.name)}
          </>
        )}

        <span className="truncate">{node.name}</span>
      </div>

      {/* Children list if folder is expanded */}
      {node.isFolder && isExpanded && node.children && (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <IDEFileTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};
