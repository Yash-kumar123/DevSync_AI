import type { WorkspaceRole, WorkspacePermission } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Workspace Permissions Utility
// Strict Role-Based Access Control (RBAC) matrix for Workspace Collaboration.
// =============================================================================

export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  EDITOR: 2,
  VIEWER: 1,
};

const PERMISSION_MATRIX: Record<WorkspacePermission, WorkspaceRole[]> = {
  MANAGE_MEMBERS: ['OWNER', 'ADMIN'],
  EDIT_FILES: ['OWNER', 'ADMIN', 'EDITOR'],
  READ_FILES: ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'],
  TRANSFER_OWNERSHIP: ['OWNER'],
  DELETE_WORKSPACE: ['OWNER'],
  UPDATE_SETTINGS: ['OWNER', 'ADMIN'],
};

export class PermissionsUtil {
  /** Check if a given role has a specific permission. */
  static hasPermission(role: WorkspaceRole, permission: WorkspacePermission): boolean {
    const allowedRoles = PERMISSION_MATRIX[permission];
    return allowedRoles ? allowedRoles.includes(role) : false;
  }

  /** Check if role A can modify role B (e.g. change role, remove member). */
  static canManageRole(actorRole: WorkspaceRole, targetRole: WorkspaceRole): boolean {
    if (actorRole === 'OWNER') return true;
    if (actorRole === 'ADMIN') {
      // Admins cannot alter an Owner or another Admin
      return targetRole === 'EDITOR' || targetRole === 'VIEWER';
    }
    return false;
  }

  /** Determine if an actor role can assign a requested target role. */
  static canAssignRole(actorRole: WorkspaceRole, targetRole: WorkspaceRole): boolean {
    if (actorRole === 'OWNER') {
      return targetRole === 'ADMIN' || targetRole === 'EDITOR' || targetRole === 'VIEWER';
    }
    if (actorRole === 'ADMIN') {
      return targetRole === 'EDITOR' || targetRole === 'VIEWER';
    }
    return false;
  }
}
