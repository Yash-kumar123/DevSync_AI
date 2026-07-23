import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useWorkspaceStore } from '@store/workspace-store';
import * as workspaceApi from '@services/workspace.service';
import type { CreateWorkspacePayload, UpdateWorkspacePayload, JoinWorkspacePayload } from '@types';

// =============================================================================
// DevSync AI — useWorkspace Hook
// Combines Zustand workspace state with action functions (API calls + toasts).
// Single hook to import in all workspace-related components.
// =============================================================================

/** Extract a human-readable message from an unknown API error. */
function extractMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      { error?: { message?: string }; message?: string } | undefined;
    return data?.error?.message ?? data?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function useWorkspace() {
  const navigate = useNavigate();
  const store = useWorkspaceStore();

  // ── Fetch my workspaces ──────────────────────────────────────────────────

  const fetchMyWorkspaces = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      const workspaces = await workspaceApi.getMyWorkspaces();
      store.setWorkspaces(workspaces);
    } catch (error) {
      const msg = extractMessage(error, 'Failed to load workspaces.');
      store.setError(msg);
      toast.error(msg);
    }
  }, [store]);

  // ── Fetch single workspace ────────────────────────────────────────────────

  const fetchWorkspaceById = useCallback(
    async (id: string) => {
      store.setLoading(true);
      store.setError(null);
      try {
        const workspace = await workspaceApi.getWorkspaceById(id);
        store.setSelectedWorkspace(workspace);
      } catch (error) {
        const msg = extractMessage(error, 'Workspace not found.');
        store.setError(msg);
        toast.error(msg);
        navigate('/dashboard');
      } finally {
        store.setLoading(false);
      }
    },
    [store, navigate],
  );

  // ── Create ────────────────────────────────────────────────────────────────

  const createWorkspace = useCallback(
    async (payload: CreateWorkspacePayload): Promise<boolean> => {
      store.setActing(true);
      store.setError(null);
      try {
        const workspace = await workspaceApi.createWorkspace(payload);
        store.addWorkspace(workspace);
        toast.success(`Workspace "${workspace.name}" created! 🚀`);
        return true;
      } catch (error) {
        const msg = extractMessage(error, 'Failed to create workspace.');
        store.setError(msg);
        toast.error(msg);
        store.setActing(false);
        return false;
      }
    },
    [store],
  );

  // ── Update ────────────────────────────────────────────────────────────────

  const updateWorkspace = useCallback(
    async (id: string, payload: UpdateWorkspacePayload): Promise<boolean> => {
      store.setActing(true);
      store.setError(null);
      try {
        const workspace = await workspaceApi.updateWorkspace(id, payload);
        store.updateWorkspace(workspace);
        toast.success('Workspace updated.');
        return true;
      } catch (error) {
        const msg = extractMessage(error, 'Failed to update workspace.');
        store.setError(msg);
        toast.error(msg);
        store.setActing(false);
        return false;
      }
    },
    [store],
  );

  // ── Delete ────────────────────────────────────────────────────────────────

  const deleteWorkspace = useCallback(
    async (id: string): Promise<boolean> => {
      store.setActing(true);
      store.setError(null);
      try {
        await workspaceApi.deleteWorkspace(id);
        store.removeWorkspace(id);
        toast.success('Workspace deleted.');
        navigate('/dashboard');
        return true;
      } catch (error) {
        const msg = extractMessage(error, 'Failed to delete workspace.');
        store.setError(msg);
        toast.error(msg);
        store.setActing(false);
        return false;
      }
    },
    [store, navigate],
  );

  // ── Join ──────────────────────────────────────────────────────────────────

  const joinWorkspace = useCallback(
    async (payload: JoinWorkspacePayload): Promise<boolean> => {
      store.setActing(true);
      store.setError(null);
      try {
        const workspace = await workspaceApi.joinWorkspace(payload);
        store.setActing(false);
        toast.success(`Found "${workspace.name}"! Opening workspace…`);
        // Navigate to the workspace detail page (by DB id)
        navigate(`/workspace/details/${workspace.id}`);
        return true;
      } catch (error) {
        const msg = extractMessage(error, 'Room code not found. Please check and try again.');
        store.setError(msg);
        toast.error(msg);
        store.setActing(false);
        return false;
      }
    },
    [store, navigate],
  );

  return {
    // State
    workspaces: store.workspaces,
    selectedWorkspace: store.selectedWorkspace,
    isLoading: store.isLoading,
    isActing: store.isActing,
    error: store.error,

    // Actions
    fetchMyWorkspaces,
    fetchWorkspaceById,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    joinWorkspace,
  };
}
