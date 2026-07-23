export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
export type WorkspacePermission =
  | 'MANAGE_MEMBERS'
  | 'EDIT_FILES'
  | 'READ_FILES'
  | 'TRANSFER_OWNERSHIP'
  | 'DELETE_WORKSPACE'
  | 'UPDATE_SETTINGS';
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
    avatarUrl?: string | null;
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
  workspaceName?: string;
  inviter?: {
    id: string;
    username: string;
    displayName: string;
  };
}
export interface NotificationDTO {
  id: string;
  userId: string;
  workspaceId?: string | null;
  type: 'INVITATION' | 'WORKSPACE_EVENT' | 'MEMBER_JOIN' | 'MEMBER_LEAVE' | 'ROLE_CHANGE';
  title: string;
  message: string;
  payload?: Record<string, unknown> | string | null;
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
  details?: string | null;
  createdAt: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}
export interface PresenceUser {
  socketId: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  role: WorkspaceRole;
  color: string;
  isOnline: boolean;
  lastActive: string;
  isTyping: boolean;
  activeFile?: string | null;
  cursor?: {
    lineNumber: number;
    column: number;
    selectionHead?: {
      lineNumber: number;
      column: number;
    };
  };
}
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
  filePath?: string;
}
//# sourceMappingURL=collaboration.d.ts.map
