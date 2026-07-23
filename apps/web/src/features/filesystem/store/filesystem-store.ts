import { create } from 'zustand';
import toast from 'react-hot-toast';
import type {
  DBFolder,
  DBFile,
  TreeNode,
  ContextMenuState,
  CreatingNodeState,
} from '../types/filesystem.types';
import { filesystemService } from '../services/filesystem.service';
import { buildFileTree } from '../utils/tree-builder';
import { socketClient } from '../../collaboration/services/socket-client';

// Debounce timer store per file id
const autoSaveTimers: Record<string, NodeJS.Timeout> = {};

interface FileSystemState {
  workspaceId: string | null;
  folders: DBFolder[];
  files: DBFile[];
  tree: TreeNode[];
  openFiles: DBFile[];
  activeFileId: string | null;
  selectedFolderId: string | null;
  expandedFolderIds: Set<string>;
  unsavedFileIds: Set<string>;
  contextMenu: ContextMenuState;
  creatingNode: CreatingNodeState | null;
  renamingNodeId: string | null;
  isLoading: boolean;

  // Actions
  setWorkspaceId: (id: string) => void;
  fetchWorkspaceFileSystem: (workspaceId: string) => Promise<void>;
  createFolder: (name: string, parentId?: string | null) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  createFile: (fileName: string, folderId?: string | null, content?: string) => Promise<void>;
  renameFile: (id: string, fileName: string) => Promise<void>;
  updateFileContentLocally: (id: string, content: string) => void;
  saveFileContent: (id: string) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  openFile: (file: DBFile) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  toggleFolderExpand: (folderId: string) => void;
  collapseAllFolders: () => void;
  setSelectedFolder: (folderId: string | null) => void;
  setContextMenu: (state: ContextMenuState) => void;
  closeContextMenu: () => void;
  setCreatingNode: (state: CreatingNodeState | null) => void;
  setRenamingNodeId: (id: string | null) => void;
  moveNode: (
    item: { id: string; type: 'file' | 'folder' },
    targetFolderId: string | null,
  ) => Promise<void>;
}

export const useFileSystemStore = create<FileSystemState>((set, get) => ({
  workspaceId: null,
  folders: [],
  files: [],
  tree: [],
  openFiles: [],
  activeFileId: null,
  selectedFolderId: null,
  expandedFolderIds: new Set<string>(),
  unsavedFileIds: new Set<string>(),
  contextMenu: {
    isOpen: false,
    x: 0,
    y: 0,
    type: 'root',
    targetId: null,
    parentId: null,
  },
  creatingNode: null,
  renamingNodeId: null,
  isLoading: false,

  setWorkspaceId: (id: string) => set({ workspaceId: id }),

  fetchWorkspaceFileSystem: async (workspaceId: string) => {
    set({ isLoading: true, workspaceId });
    try {
      const [folders, files] = await Promise.all([
        filesystemService.getFolders(workspaceId),
        filesystemService.getFiles(workspaceId),
      ]);

      const tree = buildFileTree(folders, files);
      set({ folders, files, tree, isLoading: false });

      // Automatically open initial file if openFiles is empty
      if (files.length > 0 && get().openFiles.length === 0 && files[0]) {
        get().openFile(files[0]);
      }
    } catch (err: unknown) {
      set({ isLoading: false });
      const msg = err instanceof Error ? err.message : 'Failed to load project files';
      toast.error(msg);
    }
  },

  createFolder: async (name: string, parentId?: string | null) => {
    const { workspaceId, folders, files } = get();
    if (!workspaceId) return;

    try {
      const newFolder = await filesystemService.createFolder(workspaceId, name, parentId);
      const updatedFolders = [...folders, newFolder];
      const updatedTree = buildFileTree(updatedFolders, files);

      const expanded = new Set(get().expandedFolderIds);
      if (parentId) expanded.add(parentId);
      expanded.add(newFolder.id);

      set({
        folders: updatedFolders,
        tree: updatedTree,
        creatingNode: null,
        expandedFolderIds: expanded,
      });
      socketClient.emitFileChanged(workspaceId, 'create', name);
      toast.success(`Folder '${name}' created`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create folder');
    }
  },

  renameFolder: async (id: string, name: string) => {
    const { workspaceId, folders, files } = get();
    try {
      const updatedFolder = await filesystemService.updateFolder(id, name);
      const updatedFolders = folders.map((f) => (f.id === id ? updatedFolder : f));
      const updatedTree = buildFileTree(updatedFolders, files);

      set({ folders: updatedFolders, tree: updatedTree, renamingNodeId: null });
      if (workspaceId) socketClient.emitFileChanged(workspaceId, 'update', name);
      toast.success(`Folder renamed to '${name}'`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to rename folder');
    }
  },

  deleteFolder: async (id: string) => {
    const { workspaceId, folders, files } = get();
    try {
      await filesystemService.deleteFolder(id);
      const updatedFolders = folders.filter((f) => f.id !== id);
      const updatedFiles = files.filter((f) => f.folderId !== id);
      const updatedTree = buildFileTree(updatedFolders, updatedFiles);

      set({ folders: updatedFolders, files: updatedFiles, tree: updatedTree });
      if (workspaceId) socketClient.emitFileChanged(workspaceId, 'delete');
      toast.success('Folder deleted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete folder');
    }
  },

  createFile: async (fileName: string, folderId?: string | null, content?: string) => {
    const { workspaceId, folders, files } = get();
    if (!workspaceId) return;

    try {
      const newFile = await filesystemService.createFile(workspaceId, fileName, folderId, content);
      const updatedFiles = [...files, newFile];
      const updatedTree = buildFileTree(folders, updatedFiles);

      const expanded = new Set(get().expandedFolderIds);
      if (folderId) expanded.add(folderId);

      set({
        files: updatedFiles,
        tree: updatedTree,
        creatingNode: null,
        expandedFolderIds: expanded,
      });

      get().openFile(newFile);
      socketClient.emitFileChanged(workspaceId, 'create', fileName);
      toast.success(`File '${fileName}' created`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create file');
    }
  },

  renameFile: async (id: string, fileName: string) => {
    const { workspaceId, folders, files, openFiles } = get();
    try {
      const updatedFile = await filesystemService.updateFile(id, { fileName });
      const updatedFiles = files.map((f) => (f.id === id ? updatedFile : f));
      const updatedOpenFiles = openFiles.map((f) => (f.id === id ? updatedFile : f));
      const updatedTree = buildFileTree(folders, updatedFiles);

      set({
        files: updatedFiles,
        openFiles: updatedOpenFiles,
        tree: updatedTree,
        renamingNodeId: null,
      });
      if (workspaceId) socketClient.emitFileChanged(workspaceId, 'update', fileName);
      toast.success(`File renamed to '${fileName}'`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to rename file');
    }
  },

  updateFileContentLocally: (id: string, content: string) => {
    const { files, openFiles, unsavedFileIds } = get();

    const updatedFiles = files.map((f) => (f.id === id ? { ...f, content } : f));
    const updatedOpenFiles = openFiles.map((f) => (f.id === id ? { ...f, content } : f));
    const updatedUnsaved = new Set(unsavedFileIds).add(id);

    set({
      files: updatedFiles,
      openFiles: updatedOpenFiles,
      unsavedFileIds: updatedUnsaved,
    });

    // Setup 500ms debounced auto-save to API
    if (autoSaveTimers[id]) {
      clearTimeout(autoSaveTimers[id]);
    }

    autoSaveTimers[id] = setTimeout(() => {
      void get().saveFileContent(id);
    }, 500);
  },

  saveFileContent: async (id: string) => {
    const file = get().files.find((f) => f.id === id);
    if (!file) return;

    try {
      await filesystemService.updateFile(id, { content: file.content });
      const unsaved = new Set(get().unsavedFileIds);
      unsaved.delete(id);
      set({ unsavedFileIds: unsaved });
    } catch (err: unknown) {
      console.error('Auto-save error:', err);
    }
  },

  deleteFile: async (id: string) => {
    const { folders, files, openFiles, activeFileId } = get();
    try {
      await filesystemService.deleteFile(id);
      const updatedFiles = files.filter((f) => f.id !== id);
      const updatedOpenFiles = openFiles.filter((f) => f.id !== id);
      const updatedTree = buildFileTree(folders, updatedFiles);

      let nextActiveId = activeFileId;
      if (activeFileId === id) {
        const lastFile = updatedOpenFiles[updatedOpenFiles.length - 1];
        nextActiveId = updatedOpenFiles.length > 0 && lastFile ? lastFile.id : null;
      }

      set({
        files: updatedFiles,
        openFiles: updatedOpenFiles,
        activeFileId: nextActiveId,
        tree: updatedTree,
      });
      toast.success('File deleted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete file');
    }
  },

  openFile: (file: DBFile) => {
    const { openFiles } = get();
    const exists = openFiles.some((f) => f.id === file.id);
    const updatedOpenFiles = exists ? openFiles : [...openFiles, file];

    set({
      openFiles: updatedOpenFiles,
      activeFileId: file.id,
    });
  },

  closeFile: (fileId: string) => {
    const { openFiles, activeFileId } = get();
    const updatedOpenFiles = openFiles.filter((f) => f.id !== fileId);

    let nextActiveId = activeFileId;
    if (activeFileId === fileId) {
      const lastFile = updatedOpenFiles[updatedOpenFiles.length - 1];
      nextActiveId = updatedOpenFiles.length > 0 && lastFile ? lastFile.id : null;
    }

    set({
      openFiles: updatedOpenFiles,
      activeFileId: nextActiveId,
    });
  },

  setActiveFile: (fileId: string) => set({ activeFileId: fileId }),

  toggleFolderExpand: (folderId: string) => {
    const expanded = new Set(get().expandedFolderIds);
    if (expanded.has(folderId)) {
      expanded.delete(folderId);
    } else {
      expanded.add(folderId);
    }
    set({ expandedFolderIds: expanded });
  },

  collapseAllFolders: () => set({ expandedFolderIds: new Set<string>() }),

  setSelectedFolder: (folderId: string | null) => set({ selectedFolderId: folderId }),

  setContextMenu: (state: ContextMenuState) => set({ contextMenu: state }),

  closeContextMenu: () =>
    set({
      contextMenu: {
        isOpen: false,
        x: 0,
        y: 0,
        type: 'root',
        targetId: null,
        parentId: null,
      },
    }),

  setCreatingNode: (state: CreatingNodeState | null) => set({ creatingNode: state }),

  setRenamingNodeId: (id: string | null) => set({ renamingNodeId: id }),

  moveNode: async (
    item: { id: string; type: 'file' | 'folder' },
    targetFolderId: string | null,
  ) => {
    const { folders, files } = get();
    try {
      if (item.type === 'folder') {
        if (item.id === targetFolderId) return; // Cannot drop into itself
        const targetFolder = folders.find((f) => f.id === item.id);
        if (!targetFolder) return;
        const updated = await filesystemService.updateFolder(
          item.id,
          targetFolder.name,
          targetFolderId,
        );
        const updatedFolders = folders.map((f) => (f.id === item.id ? updated : f));
        set({ folders: updatedFolders, tree: buildFileTree(updatedFolders, files) });
      } else {
        const updated = await filesystemService.updateFile(item.id, { folderId: targetFolderId });
        const updatedFiles = files.map((f) => (f.id === item.id ? updated : f));
        set({ files: updatedFiles, tree: buildFileTree(folders, updatedFiles) });
      }
      toast.success(`Moved ${item.type} into destination`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to move item');
    }
  },
}));
