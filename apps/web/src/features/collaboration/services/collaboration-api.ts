import { http } from '../../../services/http.js';
import type {
  WorkspaceMemberDTO,
  WorkspaceInvitationDTO,
  NotificationDTO,
  ActivityLogDTO,
  WorkspaceRole,
} from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Collaboration REST API Client
// HTTP endpoints for workspace invitations, membership, notifications,
// activity feed, and workspace settings.
// =============================================================================

export class CollaborationApiClient {
  /** Get members of a workspace. */
  async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberDTO[]> {
    const res = await http.get<{ success: boolean; members: WorkspaceMemberDTO[] }>(
      `/v1/workspaces/${workspaceId}/members`,
    );
    return res.data.members;
  }

  /** Invite member to workspace by email. */
  async inviteMember(
    workspaceId: string,
    email: string,
    role: WorkspaceRole,
  ): Promise<{ invitation: WorkspaceInvitationDTO; notificationSent: boolean; message: string }> {
    const res = await http.post<{
      success: boolean;
      invitation: WorkspaceInvitationDTO;
      notificationSent: boolean;
      message: string;
    }>(`/v1/workspaces/${workspaceId}/invitations`, { email, role });
    return res.data;
  }

  /** Get pending invitations for logged in user. */
  async getPendingInvitations(): Promise<WorkspaceInvitationDTO[]> {
    const res = await http.get<{ success: boolean; invitations: WorkspaceInvitationDTO[] }>(
      '/v1/invitations/pending',
    );
    return res.data.invitations;
  }

  /** Respond to invitation (accept / decline). */
  async respondToInvitation(
    token: string,
    accept: boolean,
  ): Promise<{ member?: WorkspaceMemberDTO; message: string }> {
    const res = await http.post<{ success: boolean; member?: WorkspaceMemberDTO; message: string }>(
      `/v1/invitations/${token}/respond`,
      { accept },
    );
    return res.data;
  }

  /** Update workspace role for a member. */
  async updateMemberRole(
    workspaceId: string,
    targetUserId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMemberDTO> {
    const res = await http.patch<{ success: boolean; member: WorkspaceMemberDTO }>(
      `/v1/workspaces/${workspaceId}/members/${targetUserId}/role`,
      { role },
    );
    return res.data.member;
  }

  /** Remove member from workspace. */
  async removeMember(workspaceId: string, targetUserId: string): Promise<string> {
    const res = await http.delete<{ success: boolean; message: string }>(
      `/v1/workspaces/${workspaceId}/members/${targetUserId}`,
    );
    return res.data.message;
  }

  /** Transfer workspace ownership. */
  async transferOwnership(
    workspaceId: string,
    newOwnerId: string,
  ): Promise<{ workspaceId: string; newOwnerId: string; previousOwnerId: string }> {
    const res = await http.post<{
      success: boolean;
      workspaceId: string;
      newOwnerId: string;
      previousOwnerId: string;
    }>(`/v1/workspaces/${workspaceId}/transfer-ownership`, { newOwnerId });
    return res.data;
  }

  /** Rename workspace. */
  async renameWorkspace(workspaceId: string, name: string): Promise<{ id: string; name: string }> {
    const res = await http.patch<{ success: boolean; workspace: { id: string; name: string } }>(
      `/v1/workspaces/${workspaceId}/settings`,
      { name },
    );
    return res.data.workspace;
  }

  /** Delete workspace. */
  async deleteWorkspace(workspaceId: string): Promise<boolean> {
    const res = await http.delete<{ success: boolean }>(`/v1/workspaces/${workspaceId}`);
    return res.data.success;
  }

  /** Get user notifications. */
  async getNotifications(): Promise<NotificationDTO[]> {
    const res = await http.get<{ success: boolean; notifications: NotificationDTO[] }>(
      '/v1/notifications',
    );
    return res.data.notifications;
  }

  /** Mark notification as read. */
  async markNotificationRead(notificationId: string): Promise<NotificationDTO | null> {
    const res = await http.patch<{ success: boolean; notification: NotificationDTO | null }>(
      `/v1/notifications/${notificationId}/read`,
    );
    return res.data.notification;
  }

  /** Mark all notifications as read. */
  async markAllNotificationsRead(): Promise<number> {
    const res = await http.patch<{ success: boolean; count: number }>('/v1/notifications/read-all');
    return res.data.count;
  }

  /** Get workspace activity log history. */
  async getWorkspaceActivities(workspaceId: string): Promise<ActivityLogDTO[]> {
    const res = await http.get<{ success: boolean; activities: ActivityLogDTO[] }>(
      `/v1/workspaces/${workspaceId}/activities`,
    );
    return res.data.activities;
  }
}

export const collaborationApi = new CollaborationApiClient();
