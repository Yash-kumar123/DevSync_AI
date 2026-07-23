import { Router } from 'express';
import { CollaborationController } from '../controllers/collaboration.controller.js';
import { authenticate } from '../../../middlewares/authenticate.middleware.js';

// =============================================================================
// DevSync AI — Collaboration Express Routes
// Express router for Workspace Collaboration, Members, Roles, Notifications,
// and Activities.
// =============================================================================

export const collaborationRouter = Router();
const controller = new CollaborationController();

// Apply authentication middleware to all collaboration endpoints
collaborationRouter.use(authenticate);

// ── Notifications ────────────────────────────────────────────────────────────
collaborationRouter.get('/notifications', controller.getNotifications);
collaborationRouter.patch('/notifications/read-all', controller.markAllNotificationsRead);
collaborationRouter.patch('/notifications/:notificationId/read', controller.markNotificationRead);

// ── User Invitations ─────────────────────────────────────────────────────────
collaborationRouter.get('/invitations/pending', controller.getPendingInvitations);
collaborationRouter.post('/invitations/:token/respond', controller.respondToInvitation);

// ── Workspace Specific Routes ────────────────────────────────────────────────
collaborationRouter.get('/workspaces/:workspaceId/members', controller.getMembers);
collaborationRouter.post('/workspaces/:workspaceId/invitations', controller.inviteUser);
collaborationRouter.patch(
  '/workspaces/:workspaceId/members/:targetUserId/role',
  controller.updateMemberRole,
);
collaborationRouter.delete(
  '/workspaces/:workspaceId/members/:targetUserId',
  controller.removeMember,
);
collaborationRouter.post(
  '/workspaces/:workspaceId/transfer-ownership',
  controller.transferOwnership,
);
collaborationRouter.patch('/workspaces/:workspaceId/settings', controller.renameWorkspace);
collaborationRouter.delete('/workspaces/:workspaceId', controller.deleteWorkspace);
collaborationRouter.get('/workspaces/:workspaceId/activities', controller.getActivities);
