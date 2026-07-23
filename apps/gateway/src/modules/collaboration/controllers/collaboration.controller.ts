import type { Request, Response, NextFunction } from 'express';
import { CollaborationService } from '../services/collaboration.service.js';
import { NotificationService } from '../services/notification.service.js';
import { ActivityService } from '../services/activity.service.js';
import { createHttpError } from '../../../utils/http-error.js';
import type { WorkspaceRole } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Collaboration Express Controller
// Exposes REST APIs for workspace invitations, membership, notifications,
// settings, and audit logs.
// =============================================================================

function parseParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] ?? '';
  return param ?? '';
}

export class CollaborationController {
  constructor(
    private readonly collaborationService: CollaborationService = new CollaborationService(),
    private readonly notificationService: NotificationService = new NotificationService(),
    private readonly activityService: ActivityService = new ActivityService(),
  ) {}

  /** GET /api/v1/workspaces/:workspaceId/members */
  getMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = parseParam(req.params['workspaceId']);
      const userId = req.user?.id;
      if (!userId || !workspaceId) {
        throw createHttpError('Unauthorized or invalid parameters.', 401);
      }

      const members = await this.collaborationService.getWorkspaceMembers(workspaceId, userId);
      res.json({ success: true, members });
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/v1/workspaces/:workspaceId/invitations */
  inviteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = parseParam(req.params['workspaceId']);
      const userId = req.user?.id;
      const { email, role } = req.body as { email?: string; role?: WorkspaceRole };

      if (!userId || !workspaceId) {
        throw createHttpError('Unauthorized or invalid parameters.', 401);
      }

      if (!email || !role) {
        throw createHttpError('Email and role are required fields.', 400);
      }

      const result = await this.collaborationService.inviteUser(
        workspaceId,
        userId,
        email.toLowerCase().trim(),
        role,
      );

      res.status(201).json({
        success: true,
        invitation: result.invitation,
        notificationSent: result.notificationSent,
        message: `Invitation sent to ${email}.`,
      });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/invitations/pending */
  getPendingInvitations = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        throw createHttpError('Unauthorized.', 401);
      }

      const invitations = await this.collaborationService.getPendingInvitationsForUser(userEmail);
      res.json({ success: true, invitations });
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/v1/invitations/:token/respond */
  respondToInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = parseParam(req.params['token']);
      const userId = req.user?.id;
      const { accept } = req.body as { accept?: boolean };

      if (!userId || !token) {
        throw createHttpError('Unauthorized or invalid parameters.', 401);
      }

      if (typeof accept !== 'boolean') {
        throw createHttpError('Field "accept" must be a boolean.', 400);
      }

      const result = await this.collaborationService.respondToInvitation(token, userId, accept);
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/v1/workspaces/:workspaceId/members/:targetUserId/role */
  updateMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = parseParam(req.params['workspaceId']);
      const targetUserId = parseParam(req.params['targetUserId']);
      const userId = req.user?.id;
      const { role } = req.body as { role?: WorkspaceRole };

      if (!userId || !workspaceId || !targetUserId) {
        throw createHttpError('Unauthorized or invalid parameters.', 401);
      }

      if (!role) {
        throw createHttpError('Target role is required.', 400);
      }

      const updatedMember = await this.collaborationService.updateMemberRole(
        workspaceId,
        userId,
        targetUserId,
        role,
      );

      res.json({ success: true, member: updatedMember });
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/v1/workspaces/:workspaceId/members/:targetUserId */
  removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = parseParam(req.params['workspaceId']);
      const targetUserId = parseParam(req.params['targetUserId']);
      const userId = req.user?.id;

      if (!userId || !workspaceId || !targetUserId) {
        throw createHttpError('Unauthorized or invalid parameters.', 401);
      }

      const result = await this.collaborationService.removeMember(
        workspaceId,
        userId,
        targetUserId,
      );
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };

  /** POST /api/v1/workspaces/:workspaceId/transfer-ownership */
  transferOwnership = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = parseParam(req.params['workspaceId']);
      const userId = req.user?.id;
      const { newOwnerId } = req.body as { newOwnerId?: string };

      if (!userId || !workspaceId) {
        throw createHttpError('Unauthorized or invalid parameters.', 401);
      }

      if (!newOwnerId) {
        throw createHttpError('newOwnerId is required.', 400);
      }

      const result = await this.collaborationService.transferOwnership(
        workspaceId,
        userId,
        newOwnerId,
      );

      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/v1/workspaces/:workspaceId/settings */
  renameWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = parseParam(req.params['workspaceId']);
      const userId = req.user?.id;
      const { name } = req.body as { name?: string };

      if (!userId || !workspaceId) {
        throw createHttpError('Unauthorized or invalid parameters.', 401);
      }

      if (!name || name.trim().length === 0) {
        throw createHttpError('Workspace name cannot be empty.', 400);
      }

      const result = await this.collaborationService.renameWorkspace(
        workspaceId,
        userId,
        name.trim(),
      );

      res.json({ success: true, workspace: result });
    } catch (err) {
      next(err);
    }
  };

  /** DELETE /api/v1/workspaces/:workspaceId */
  deleteWorkspace = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = parseParam(req.params['workspaceId']);
      const userId = req.user?.id;

      if (!userId || !workspaceId) {
        throw createHttpError('Unauthorized or invalid parameters.', 401);
      }

      const result = await this.collaborationService.deleteWorkspace(workspaceId, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/notifications */
  getNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createHttpError('Unauthorized.', 401);
      }

      const notifications = await this.notificationService.getUserNotifications(userId);
      res.json({ success: true, notifications });
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/v1/notifications/:notificationId/read */
  markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const notificationId = parseParam(req.params['notificationId']);
      const userId = req.user?.id;

      if (!userId || !notificationId) {
        throw createHttpError('Unauthorized or invalid parameters.', 401);
      }

      const notification = await this.notificationService.markAsRead(notificationId, userId);
      res.json({ success: true, notification });
    } catch (err) {
      next(err);
    }
  };

  /** PATCH /api/v1/notifications/read-all */
  markAllNotificationsRead = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createHttpError('Unauthorized.', 401);
      }

      const count = await this.notificationService.markAllAsRead(userId);
      res.json({ success: true, count });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/workspaces/:workspaceId/activities */
  getActivities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaceId = parseParam(req.params['workspaceId']);
      const userId = req.user?.id;

      if (!userId || !workspaceId) {
        throw createHttpError('Unauthorized or invalid parameters.', 401);
      }

      const activities = await this.activityService.getWorkspaceActivities(workspaceId);
      res.json({ success: true, activities });
    } catch (err) {
      next(err);
    }
  };
}
