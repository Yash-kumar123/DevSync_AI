import type {
  DBFolder,
  DBFile,
  TreeNode,
  FolderTreeNode,
  FileTreeNode,
} from '../types/filesystem.types';

export function buildFileTree(folders: DBFolder[], files: DBFile[]): TreeNode[] {
  const folderMap = new Map<string, FolderTreeNode>();

  // 1. Initialize folder nodes
  folders.forEach((folder) => {
    folderMap.set(folder.id, {
      id: folder.id,
      name: folder.name,
      type: 'folder',
      parentId: folder.parentId,
      children: [],
      folderData: folder,
    });
  });

  const rootNodes: TreeNode[] = [];

  // 2. Assemble folder hierarchy
  folders.forEach((folder) => {
    const node = folderMap.get(folder.id)!;
    if (folder.parentId && folderMap.has(folder.parentId)) {
      const parentNode = folderMap.get(folder.parentId)!;
      parentNode.children.push(node);
    } else {
      rootNodes.push(node);
    }
  });

  // 3. Attach files to respective folders or root
  files.forEach((file) => {
    const fileNode: FileTreeNode = {
      id: file.id,
      name: file.fileName,
      type: 'file',
      extension: file.extension,
      folderId: file.folderId,
      fileData: file,
    };

    if (file.folderId && folderMap.has(file.folderId)) {
      const parentNode = folderMap.get(file.folderId)!;
      parentNode.children.push(fileNode);
    } else {
      rootNodes.push(fileNode);
    }
  });

  // 4. Sort children: Folders first (alphabetical), then Files (alphabetical)
  const sortNodes = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type === b.type) {
        return a.name.localeCompare(b.name);
      }
      return a.type === 'folder' ? -1 : 1;
    });

    nodes.forEach((node) => {
      if (node.type === 'folder') {
        sortNodes(node.children);
      }
    });
  };

  sortNodes(rootNodes);
  return rootNodes;
}
