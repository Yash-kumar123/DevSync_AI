/**
 * @file src/types/workspace.types.ts
 * Workspace and room management type definitions.
 */

// ---------------------------------------------------------------------------
// Core workspace shape (matches API response)
// ---------------------------------------------------------------------------

export interface WorkspaceOwner {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  roomCode: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: WorkspaceOwner;
}

// ---------------------------------------------------------------------------
// Request payloads
// ---------------------------------------------------------------------------

export interface CreateWorkspacePayload {
  name: string;
  description?: string | undefined;
}

export interface UpdateWorkspacePayload {
  name?: string | undefined;
  description?: string | undefined;
}

export interface JoinWorkspacePayload {
  roomCode: string;
}

// ---------------------------------------------------------------------------
// Zustand store shape
// ---------------------------------------------------------------------------

export interface WorkspaceState {
  /** All workspaces owned by the current user. */
  workspaces: Workspace[];
  /** The workspace currently being viewed (detail page). */
  selectedWorkspace: Workspace | null;
  /** True while fetching the list of workspaces. */
  isLoading: boolean;
  /** True while an action (create / update / delete) is in progress. */
  isActing: boolean;
  /** Last error message, cleared on every new action. */
  error: string | null;
}
