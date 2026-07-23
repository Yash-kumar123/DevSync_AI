// =============================================================================
// DevSync AI — Frontend File System Types
// =============================================================================

export interface DBFolder {
  id: string;
  workspaceId: string;
  parentId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface DBFile {
  id: string;
  workspaceId: string;
  folderId: string | null;
  fileName: string;
  extension: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file';
  extension: string;
  folderId: string | null;
  fileData: DBFile;
}

export interface FolderTreeNode {
  id: string;
  name: string;
  type: 'folder';
  parentId: string | null;
  children: Array<FolderTreeNode | FileTreeNode>;
  folderData: DBFolder;
}

export type TreeNode = FolderTreeNode | FileTreeNode;

export interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  type: 'file' | 'folder' | 'root';
  targetId: string | null;
  parentId: string | null;
}

export interface CreatingNodeState {
  type: 'file' | 'folder';
  parentId: string | null;
}
