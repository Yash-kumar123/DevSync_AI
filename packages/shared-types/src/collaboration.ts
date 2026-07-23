// =============================================================================
// DevSync AI — Shared Collaboration & Presence Types
// =============================================================================

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';

export type WorkspacePermission =
  | 'MANAGE_MEMBERS'
  | 'EDIT_FILES'
  | 'READ_FILES'
  | 'TRANSFER_OWNERSHIP'
  | 'DELETE_WORKSPACE'
  | 'UPDATE_SETTINGS';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface CursorPosition {
  lineNumber: number;
  column: number;
  selectionHead?: { lineNumber: number; column: number } | undefined;
}

export interface CollaborationUser {
  socketId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null | undefined;
  color: string;
  cursor?: CursorPosition | undefined;
  isTyping: boolean;
  joinedAt: string;
}

export interface JoinRoomResponse {
  success: boolean;
  user?: CollaborationUser | undefined;
  users?: CollaborationUser[] | undefined;
  yjsState?: string | null | undefined;
  message?: string | undefined;
}

export interface WorkspaceMemberDTO {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null | undefined;
  };
}

export interface WorkspaceInvitationDTO {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  inviterId: string;
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
  workspaceName?: string | undefined;
  inviter?:
    | {
        id: string;
        username: string;
        displayName: string;
      }
    | undefined;
}

export interface NotificationDTO {
  id: string;
  userId: string;
  workspaceId?: string | null | undefined;
  type: 'INVITATION' | 'WORKSPACE_EVENT' | 'MEMBER_JOIN' | 'MEMBER_LEAVE' | 'ROLE_CHANGE';
  title: string;
  message: string;
  payload?: Record<string, unknown> | string | null | undefined;
  read: boolean;
  createdAt: string;
}

export type ActivityAction =
  | 'USER_JOINED'
  | 'USER_LEFT'
  | 'FILE_CREATED'
  | 'FILE_RENAMED'
  | 'FILE_DELETED'
  | 'WORKSPACE_CREATED'
  | 'WORKSPACE_RENAMED'
  | 'ROLE_UPDATED'
  | 'MEMBER_REMOVED'
  | 'OWNERSHIP_TRANSFERRED';

export interface ActivityLogDTO {
  id: string;
  workspaceId: string;
  userId: string;
  action: ActivityAction;
  details?: string | null | undefined;
  createdAt: string;
  user?:
    | {
        id: string;
        username: string;
        displayName: string;
        avatarUrl?: string | null | undefined;
      }
    | undefined;
}

export interface PresenceUser {
  socketId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null | undefined;
  role: WorkspaceRole;
  color: string;
  isOnline: boolean;
  lastActive: string;
  isTyping: boolean;
  activeFile?: string | null | undefined;
  cursor?: CursorPosition | undefined;
}

// ── Real-time Socket Event Payload Definitions ─────────────────────────────────

export interface UserOnlinePayload {
  workspaceId: string;
  user: PresenceUser;
  onlineUsers: PresenceUser[];
}

export interface UserOfflinePayload {
  workspaceId: string;
  userId: string;
  socketId: string;
  onlineUsers: PresenceUser[];
}

export interface WorkspaceInvitationPayload {
  invitation: WorkspaceInvitationDTO;
  targetEmail: string;
}

export interface RoleUpdatedPayload {
  workspaceId: string;
  userId: string;
  newRole: WorkspaceRole;
  updatedBy: string;
}

export interface NotificationPayload {
  notification: NotificationDTO;
}

export interface ActivityUpdatePayload {
  workspaceId: string;
  activity: ActivityLogDTO;
}

export interface TypingStatusPayload {
  workspaceId: string;
  userId: string;
  socketId: string;
  isTyping: boolean;
  filePath?: string | undefined;
}
