import { create } from 'zustand';
import type { FileNode, RightPanelTab, EditorSettings, CursorPosition } from '../types/ide.types';
import { INITIAL_FILE_TREE, SAMPLE_FILE_CONTENTS } from '../data/sample-files';

// =============================================================================
// DevSync AI — IDE State Store (Zustand)
// Manages open editor tabs, active file, file tree expansion, file contents,
// editor configurations, right panel tabs, and cursor metrics.
// =============================================================================

interface IDEState {
  fileTree: FileNode[];
  fileContents: Record<string, { language: string; content: string }>;
  openFileIds: string[];
  activeFileId: string | null;
  expandedFolderIds: Set<string>;
  leftSidebarOpen: boolean;
  rightPanelOpen: boolean;
  activeRightTab: RightPanelTab;
  editorSettings: EditorSettings;
  cursorPosition: CursorPosition;
}

interface IDEActions {
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  setActiveFile: (fileId: string) => void;
  toggleFolder: (folderPath: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
  toggleLeftSidebar: () => void;
  toggleRightPanel: () => void;
  setActiveRightTab: (tab: RightPanelTab) => void;
  updateEditorSettings: (settings: Partial<EditorSettings>) => void;
  setCursorPosition: (line: number, column: number) => void;
}

const defaultFileId = 'src/App.tsx';

const initialState: IDEState = {
  fileTree: INITIAL_FILE_TREE,
  fileContents: SAMPLE_FILE_CONTENTS,
  openFileIds: [defaultFileId, 'src/components/Button.tsx'],
  activeFileId: defaultFileId,
  expandedFolderIds: new Set(['src', 'src/components', 'src/pages']),
  leftSidebarOpen: true,
  rightPanelOpen: false,
  activeRightTab: 'ai',
  editorSettings: {
    theme: 'vs-dark',
    fontSize: 14,
    minimap: true,
    wordWrap: 'on',
    readOnly: false,
    lineNumbers: 'on',
  },
  cursorPosition: { line: 1, column: 1 },
};

export const useIDEStore = create<IDEState & IDEActions>((set) => ({
  ...initialState,

  openFile: (fileId: string) =>
    set((state) => {
      const isAlreadyOpen = state.openFileIds.includes(fileId);
      const newOpenFiles = isAlreadyOpen ? state.openFileIds : [...state.openFileIds, fileId];
      return {
        openFileIds: newOpenFiles,
        activeFileId: fileId,
      };
    }),

  closeFile: (fileId: string) =>
    set((state) => {
      const newOpenFiles = state.openFileIds.filter((id) => id !== fileId);
      let newActiveFileId = state.activeFileId;

      if (state.activeFileId === fileId) {
        const closedIndex = state.openFileIds.indexOf(fileId);
        if (newOpenFiles.length > 0) {
          const nextIndex = Math.min(closedIndex, newOpenFiles.length - 1);
          newActiveFileId = newOpenFiles[nextIndex] ?? null;
        } else {
          newActiveFileId = null;
        }
      }

      return {
        openFileIds: newOpenFiles,
        activeFileId: newActiveFileId,
      };
    }),

  setActiveFile: (fileId: string) => set({ activeFileId: fileId }),

  toggleFolder: (folderPath: string) =>
    set((state) => {
      const nextExpanded = new Set(state.expandedFolderIds);
      if (nextExpanded.has(folderPath)) {
        nextExpanded.delete(folderPath);
      } else {
        nextExpanded.add(folderPath);
      }
      return { expandedFolderIds: nextExpanded };
    }),

  updateFileContent: (fileId: string, content: string) =>
    set((state) => {
      const current = state.fileContents[fileId];
      if (!current) return state;
      return {
        fileContents: {
          ...state.fileContents,
          [fileId]: { ...current, content },
        },
      };
    }),

  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),

  toggleRightPanel: () => set((state) => ({ rightPanelOpen: !state.rightPanelOpen })),

  setActiveRightTab: (tab: RightPanelTab) =>
    set((state) => ({
      activeRightTab: tab,
      rightPanelOpen: state.activeRightTab === tab && state.rightPanelOpen ? false : true,
    })),

  updateEditorSettings: (settings: Partial<EditorSettings>) =>
    set((state) => ({
      editorSettings: { ...state.editorSettings, ...settings },
    })),

  setCursorPosition: (line: number, column: number) => set({ cursorPosition: { line, column } }),
}));
