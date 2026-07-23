import { prisma } from '../../../config/prisma.js';
import { createHttpError } from '../../../utils/http-error.js';
import { PermissionsUtil } from '../utils/permissions.util.js';
import { NotificationService } from './notification.service.js';
import { ActivityService } from './activity.service.js';
import type {
  WorkspaceRole,
  WorkspaceMemberDTO,
  WorkspaceInvitationDTO,
} from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Workspace Collaboration Service
// Implements core business logic for member access control, invitations,
// role changes, ownership transfer, and workspace settings.
// =============================================================================

export class CollaborationService {
  constructor(
    private readonly notificationService: NotificationService = new NotificationService(),
    private readonly activityService: ActivityService = new ActivityService(),
  ) {}

  /** Get user's effective role in a workspace. */
  async getUserRole(workspaceId: string, userId: string): Promise<WorkspaceRole | null> {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });

    if (!workspace) return null;
    if (workspace.ownerId === userId) return 'OWNER';

    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { role: true },
    });

    return member ? (member.role as WorkspaceRole) : null;
  }

  /** Retrieve all members of a workspace. */
  async getWorkspaceMembers(workspaceId: string, actorId: string): Promise<WorkspaceMemberDTO[]> {
    const actorRole = await this.getUserRole(workspaceId, actorId);
    if (!actorRole) {
      throw createHttpError('You are not a member of this workspace.', 403);
    }

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    // Also include Owner if not already in WorkspaceMember table
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!workspace) {
      throw createHttpError('Workspace not found.', 404);
    }

    const memberList: WorkspaceMemberDTO[] = members.map((m) => ({
      id: m.id,
      workspaceId: m.workspaceId,
      userId: m.userId,
      role: m.role as WorkspaceRole,
      joinedAt: m.joinedAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      user: m.user,
    }));

    const ownerAlreadyInList = memberList.some((m) => m.userId === workspace.ownerId);
    if (!ownerAlreadyInList) {
      memberList.unshift({
        id: `owner-${workspace.id}`,
        workspaceId: workspace.id,
        userId: workspace.ownerId,
        role: 'OWNER',
        joinedAt: workspace.createdAt.toISOString(),
        updatedAt: workspace.updatedAt.toISOString(),
        user: workspace.owner,
      });
    }

    return memberList;
  }

  /** Invite a user to a workspace by email. */
  async inviteUser(
    workspaceId: string,
    actorId: string,
    email: string,
    role: WorkspaceRole,
  ): Promise<{ invitation: WorkspaceInvitationDTO; notificationSent: boolean }> {
    const actorRole = await this.getUserRole(workspaceId, actorId);
    if (!actorRole || !PermissionsUtil.hasPermission(actorRole, 'MANAGE_MEMBERS')) {
      throw createHttpError('Insufficient permissions to invite members to this workspace.', 403);
    }

    if (!PermissionsUtil.canAssignRole(actorRole, role)) {
      throw createHttpError(`You do not have permission to assign the ${role} role.`, 403);
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true },
    });

    if (!workspace) {
      throw createHttpError('Workspace not found.', 404);
    }

    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const isMember = await this.getUserRole(workspaceId, existingUser.id);
      if (isMember) {
        throw createHttpError('User is already a member of this workspace.', 400);
      }
    }

    // Create or update invitation
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.workspaceInvitation.create({
      data: {
        workspaceId,
        email,
        role,
        inviterId: actorId,
        expiresAt,
      },
      include: {
        inviter: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    let notificationSent = false;
    if (existingUser) {
      await this.notificationService.createNotification(
        existingUser.id,
        'INVITATION',
        'Workspace Invitation',
        `You have been invited to join "${workspace.name}" as an ${role}.`,
        workspaceId,
        { invitationId: invitation.id, token: invitation.token, role },
      );
      notificationSent = true;
    }

    const invitationDTO: WorkspaceInvitationDTO = {
      id: invitation.id,
      workspaceId: invitation.workspaceId,
      email: invitation.email,
      role: invitation.role as WorkspaceRole,
      inviterId: invitation.inviterId,
      token: invitation.token,
      status: invitation.status as WorkspaceInvitationDTO['status'],
      createdAt: invitation.createdAt.toISOString(),
      expiresAt: invitation.expiresAt.toISOString(),
      workspaceName: workspace.name,
      inviter: invitation.inviter,
    };

    return { invitation: invitationDTO, notificationSent };
  }

  /** Respond to an invitation (accept or reject). */
  async respondToInvitation(
    token: string,
    userId: string,
    accept: boolean,
  ): Promise<{ member?: WorkspaceMemberDTO; message: string }> {
    const invitation = await prisma.workspaceInvitation.findUnique({
      where: { token },
      include: {
        workspace: { select: { id: true, name: true } },
      },
    });

    if (!invitation || invitation.status !== 'PENDING') {
      throw createHttpError('Invitation not found or no longer active.', 404);
    }

    if (new Date() > invitation.expiresAt) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      throw createHttpError('Invitation has expired.', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw createHttpError('Invitation was sent to a different email address.', 403);
    }

    if (!accept) {
      await prisma.workspaceInvitation.update({
        where: { id: invitation.id },
        data: { status: 'REJECTED' },
      });
      return { message: 'Invitation declined.' };
    }

    // Accept invitation
    await prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { status: 'ACCEPTED' },
    });

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role,
      },
      include: {
        user: {
          select: { id: true, email: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    // Log Activity
    await this.activityService.logActivity(
      invitation.workspaceId,
      user.id,
      'USER_JOINED',
      `${user.displayName} joined the workspace as ${invitation.role}.`,
    );

    const memberDTO: WorkspaceMemberDTO = {
      id: member.id,
      workspaceId: member.workspaceId,
      userId: member.userId,
      role: member.role as WorkspaceRole,
      joinedAt: member.joinedAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
      user: member.user,
    };

    return { member: memberDTO, message: 'Successfully joined workspace.' };
  }

  /** Change workspace role of a member. */
  async updateMemberRole(
    workspaceId: string,
    actorId: string,
    targetUserId: string,
    newRole: WorkspaceRole,
  ): Promise<WorkspaceMemberDTO> {
    const actorRole = await this.getUserRole(workspaceId, actorId);
    if (!actorRole || !PermissionsUtil.hasPermission(actorRole, 'MANAGE_MEMBERS')) {
      throw createHttpError('Insufficient permissions to change member roles.', 403);
    }

    const targetRole = await this.getUserRole(workspaceId, targetUserId);
    if (!targetRole) {
      throw createHttpError('Target user is not a member of this workspace.', 404);
    }

    if (targetRole === 'OWNER') {
      throw createHttpError(
        'Cannot modify the role of the workspace Owner via role change. Transfer ownership instead.',
        400,
      );
    }

    if (!PermissionsUtil.canManageRole(actorRole, targetRole)) {
      throw createHttpError(`You cannot modify the role of a user with role ${targetRole}.`, 403);
    }

    if (!PermissionsUtil.canAssignRole(actorRole, newRole)) {
      throw createHttpError(`You do not have permission to assign the ${newRole} role.`, 403);
    }

    const updated = await prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      data: { role: newRole },
      include: {
        user: {
          select: { id: true, email: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    // Notify target user
    await this.notificationService.createNotification(
      targetUserId,
      'ROLE_CHANGE',
      'Workspace Role Updated',
      `Your role in the workspace was changed to ${newRole}.`,
      workspaceId,
      { newRole },
    );

    // Log Activity
    await this.activityService.logActivity(
      workspaceId,
      actorId,
      'ROLE_UPDATED',
      `Updated ${updated.user.displayName}'s role to ${newRole}.`,
    );

    return {
      id: updated.id,
      workspaceId: updated.workspaceId,
      userId: updated.userId,
      role: updated.role as WorkspaceRole,
      joinedAt: updated.joinedAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      user: updated.user,
    };
  }

  /** Remove a user from workspace. */
  async removeMember(
    workspaceId: string,
    actorId: string,
    targetUserId: string,
  ): Promise<{ message: string }> {
    const actorRole = await this.getUserRole(workspaceId, actorId);
    if (!actorRole || !PermissionsUtil.hasPermission(actorRole, 'MANAGE_MEMBERS')) {
      throw createHttpError('Insufficient permissions to remove members.', 403);
    }

    const targetRole = await this.getUserRole(workspaceId, targetUserId);
    if (!targetRole) {
      throw createHttpError('Target user is not a member of this workspace.', 404);
    }

    if (targetRole === 'OWNER') {
      throw createHttpError('Cannot remove the workspace Owner.', 400);
    }

    if (actorId !== targetUserId && !PermissionsUtil.canManageRole(actorRole, targetRole)) {
      throw createHttpError(`You cannot remove a member with role ${targetRole}.`, 403);
    }

    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: targetUserId } },
      include: { user: { select: { displayName: true } } },
    });

    if (member) {
      await prisma.workspaceMember.delete({
        where: { id: member.id },
      });

      // Log Activity
      await this.activityService.logActivity(
        workspaceId,
        actorId,
        'MEMBER_REMOVED',
        `${member.user.displayName} was removed from the workspace.`,
      );

      // Notify target user if removed by another user
      if (actorId !== targetUserId) {
        await this.notificationService.createNotification(
          targetUserId,
          'WORKSPACE_EVENT',
          'Removed from Workspace',
          'You have been removed from the workspace.',
          workspaceId,
        );
      }
    }

    return { message: 'Member removed successfully.' };
  }

  /** Transfer workspace ownership to another member. */
  async transferOwnership(
    workspaceId: string,
    actorId: string,
    newOwnerId: string,
  ): Promise<{ workspaceId: string; newOwnerId: string; previousOwnerId: string }> {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { owner: { select: { displayName: true } } },
    });

    if (!workspace) {
      throw createHttpError('Workspace not found.', 404);
    }

    if (workspace.ownerId !== actorId) {
      throw createHttpError('Only the workspace Owner can transfer ownership.', 403);
    }

    if (actorId === newOwnerId) {
      throw createHttpError('You are already the owner of this workspace.', 400);
    }

    const newOwnerMember = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: newOwnerId } },
      include: { user: { select: { displayName: true } } },
    });

    if (!newOwnerMember) {
      throw createHttpError(
        'Target user must be an active member of the workspace before transferring ownership.',
        400,
      );
    }

    // Transaction: update workspace owner & swap member roles
    await prisma.$transaction([
      prisma.workspace.update({
        where: { id: workspaceId },
        data: { ownerId: newOwnerId },
      }),
      // Set target user as OWNER role in member table
      prisma.workspaceMember.update({
        where: { id: newOwnerMember.id },
        data: { role: 'OWNER' },
      }),
      // Convert former owner to ADMIN member
      prisma.workspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId, userId: actorId } },
        create: {
          workspaceId,
          userId: actorId,
          role: 'ADMIN',
        },
        update: {
          role: 'ADMIN',
        },
      }),
    ]);

    // Log Activity
    await this.activityService.logActivity(
      workspaceId,
      actorId,
      'OWNERSHIP_TRANSFERRED',
      `Transferred workspace ownership to ${newOwnerMember.user.displayName}.`,
    );

    // Notify new owner
    await this.notificationService.createNotification(
      newOwnerId,
      'ROLE_CHANGE',
      'Workspace Ownership Transferred',
      `You are now the Owner of "${workspace.name}".`,
      workspaceId,
    );

    return {
      workspaceId,
      newOwnerId,
      previousOwnerId: actorId,
    };
  }

  /** Rename workspace (Owner/Admin). */
  async renameWorkspace(
    workspaceId: string,
    actorId: string,
    newName: string,
  ): Promise<{ id: string; name: string }> {
    const actorRole = await this.getUserRole(workspaceId, actorId);
    if (!actorRole || !PermissionsUtil.hasPermission(actorRole, 'UPDATE_SETTINGS')) {
      throw createHttpError('Insufficient permissions to rename workspace.', 403);
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: newName },
    });

    await this.activityService.logActivity(
      workspaceId,
      actorId,
      'WORKSPACE_RENAMED',
      `Workspace renamed to "${newName}".`,
    );

    return { id: updated.id, name: updated.name };
  }

  /** Delete workspace (Owner only). */
  async deleteWorkspace(workspaceId: string, actorId: string): Promise<{ success: boolean }> {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      throw createHttpError('Workspace not found.', 404);
    }

    if (workspace.ownerId !== actorId) {
      throw createHttpError('Only the workspace Owner can delete the workspace.', 403);
    }

    await prisma.workspace.delete({ where: { id: workspaceId } });

    return { success: true };
  }

  /** Query user's pending invitations. */
  async getPendingInvitationsForUser(email: string): Promise<WorkspaceInvitationDTO[]> {
    const invitations = await prisma.workspaceInvitation.findMany({
      where: {
        email: email.toLowerCase(),
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      include: {
        workspace: { select: { name: true } },
        inviter: { select: { id: true, username: true, displayName: true } },
      },
    });

    return invitations.map((inv) => ({
      id: inv.id,
      workspaceId: inv.workspaceId,
      email: inv.email,
      role: inv.role as WorkspaceRole,
      inviterId: inv.inviterId,
      token: inv.token,
      status: inv.status as WorkspaceInvitationDTO['status'],
      createdAt: inv.createdAt.toISOString(),
      expiresAt: inv.expiresAt.toISOString(),
      workspaceName: inv.workspace.name,
      inviter: inv.inviter,
    }));
  }
}
