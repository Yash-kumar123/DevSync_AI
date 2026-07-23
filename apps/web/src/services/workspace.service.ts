import { http } from './http';
import type {
  ApiResponse,
  Workspace,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  JoinWorkspacePayload,
} from '@types';

// =============================================================================
// DevSync AI — Workspace API Service
// Typed Axios wrappers around all workspace endpoints.
// =============================================================================

const BASE = '/v1/workspace';

/** Create a new workspace. Returns the created workspace with owner info. */
export async function createWorkspace(payload: CreateWorkspacePayload): Promise<Workspace> {
  const res = await http.post<ApiResponse<{ workspace: Workspace }>>(`${BASE}/create`, payload);
  return res.data.data.workspace;
}

/** Fetch all workspaces owned by the authenticated user. */
export async function getMyWorkspaces(): Promise<Workspace[]> {
  const res = await http.get<ApiResponse<{ workspaces: Workspace[] }>>(`${BASE}/my`);
  return res.data.data.workspaces;
}

/** Fetch a single workspace by its database id. */
export async function getWorkspaceById(id: string): Promise<Workspace> {
  const res = await http.get<ApiResponse<{ workspace: Workspace }>>(`${BASE}/${id}`);
  return res.data.data.workspace;
}

/** Update a workspace (owner only). */
export async function updateWorkspace(
  id: string,
  payload: UpdateWorkspacePayload,
): Promise<Workspace> {
  const res = await http.put<ApiResponse<{ workspace: Workspace }>>(`${BASE}/${id}`, payload);
  return res.data.data.workspace;
}

/** Delete a workspace (owner only). */
export async function deleteWorkspace(id: string): Promise<void> {
  await http.delete(`${BASE}/${id}`);
}

/** Resolve a workspace from its room code. Returns workspace details. */
export async function joinWorkspace(payload: JoinWorkspacePayload): Promise<Workspace> {
  const res = await http.post<ApiResponse<{ workspace: Workspace }>>(`${BASE}/join`, payload);
  return res.data.data.workspace;
}
