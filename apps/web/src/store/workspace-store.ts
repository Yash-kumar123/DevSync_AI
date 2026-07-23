import { create } from 'zustand';
import type { Workspace, WorkspaceState } from '@types';

// =============================================================================
// DevSync AI — Workspace Store (Zustand)
// Manages the list of workspaces, loading states, and selected workspace.
// NOT persisted to localStorage — always fetched fresh from the API.
// =============================================================================

interface WorkspaceActions {
  /** Replace the full workspace list (from GET /workspace/my). */
  setWorkspaces: (workspaces: Workspace[]) => void;
  /** Add a single workspace to the front of the list (after create). */
  addWorkspace: (workspace: Workspace) => void;
  /** Replace a workspace in the list (after update). */
  updateWorkspace: (workspace: Workspace) => void;
  /** Remove a workspace from the list (after delete). */
  removeWorkspace: (id: string) => void;
  /** Set the workspace currently being viewed. */
  setSelectedWorkspace: (workspace: Workspace | null) => void;
  /** Toggle list-loading state. */
  setLoading: (loading: boolean) => void;
  /** Toggle action-in-progress state (create/update/delete). */
  setActing: (acting: boolean) => void;
  /** Set an error message. */
  setError: (error: string | null) => void;
  /** Reset the entire store to initial state. */
  reset: () => void;
}

const initialState: WorkspaceState = {
  workspaces: [],
  selectedWorkspace: null,
  isLoading: false,
  isActing: false,
  error: null,
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()((set) => ({
  ...initialState,

  setWorkspaces: (workspaces) => set({ workspaces, isLoading: false, error: null }),

  addWorkspace: (workspace) =>
    set((state) => ({
      workspaces: [workspace, ...state.workspaces],
      isActing: false,
    })),

  updateWorkspace: (workspace) =>
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === workspace.id ? workspace : w)),
      selectedWorkspace:
        state.selectedWorkspace?.id === workspace.id ? workspace : state.selectedWorkspace,
      isActing: false,
    })),

  removeWorkspace: (id) =>
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      selectedWorkspace: state.selectedWorkspace?.id === id ? null : state.selectedWorkspace,
      isActing: false,
    })),

  setSelectedWorkspace: (workspace) => set({ selectedWorkspace: workspace }),

  setLoading: (isLoading) => set({ isLoading }),

  setActing: (isActing) => set({ isActing }),

  setError: (error) => set({ error, isLoading: false, isActing: false }),

  reset: () => set(initialState),
}));
