import type { Server, Socket } from 'socket.io';
import { PresenceService } from '../services/presence.service.js';
import { CollaborationService } from '../services/collaboration.service.js';
import { ActivityService } from '../services/activity.service.js';
import type {
  UserOnlinePayload,
  UserOfflinePayload,
  RoleUpdatedPayload,
  NotificationPayload,
  ActivityUpdatePayload,
  TypingStatusPayload,
  WorkspaceRole,
} from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Collaboration Socket.io Event Handler
// Manages real-time WebSocket communication for Presence, Invitations, Role Changes,
// Notifications, and Activity Feed.
// =============================================================================

export class CollaborationSocketHandler {
  constructor(
    private readonly presenceService: PresenceService = new PresenceService(),
    private readonly collaborationService: CollaborationService = new CollaborationService(),
    private readonly activityService: ActivityService = new ActivityService(),
  ) {}

  registerHandlers(io: Server, socket: Socket): void {
    // ── Join Workspace Room & Announce Presence ──────────────────────────────
    socket.on(
      'join-workspace',
      async (
        payload: {
          workspaceId: string;
          user: {
            id: string;
            username: string;
            displayName: string;
            avatarUrl?: string | null | undefined;
          };
        },
        callback?: (res: {
          success: boolean;
          role?: WorkspaceRole;
          onlineUsers?: unknown[];
        }) => void,
      ) => {
        try {
          const { workspaceId, user } = payload;
          const userRole = await this.collaborationService.getUserRole(workspaceId, user.id);

          if (!userRole) {
            if (callback) callback({ success: false });
            return;
          }

          const roomKey = `workspace:${workspaceId}`;
          const userKey = `user:${user.id}`;

          socket.join(roomKey);
          socket.join(userKey);

          // Add to Presence Service
          const presenceUser = this.presenceService.userJoined(socket.id, workspaceId, {
            ...user,
            role: userRole,
          });

          const onlineUsers = this.presenceService.getOnlineUsers(workspaceId);

          // 1. Emit `user-online` event to all peers in workspace
          const userOnlineData: UserOnlinePayload = {
            workspaceId,
            user: presenceUser,
            onlineUsers,
          };
          io.to(roomKey).emit('user-online', userOnlineData);

          // Log join activity
          const activity = await this.activityService.logActivity(
            workspaceId,
            user.id,
            'USER_JOINED',
            `${user.displayName} is now active in workspace.`,
          );

          // Emit `activity-update`
          const activityPayload: ActivityUpdatePayload = { workspaceId, activity };
          io.to(roomKey).emit('activity-update', activityPayload);

          if (callback) {
            callback({ success: true, role: userRole, onlineUsers });
          }
        } catch {
          if (callback) callback({ success: false });
        }
      },
    );

    // ── Leave Workspace Room ────────────────────────────────────────────────
    socket.on('leave-workspace', (payload: { workspaceId: string }) => {
      const roomKey = `workspace:${payload.workspaceId}`;
      socket.leave(roomKey);

      const { workspaceId, userId, remainingUsers } = this.presenceService.userLeft(socket.id);
      if (workspaceId && userId) {
        const offlinePayload: UserOfflinePayload = {
          workspaceId,
          userId,
          socketId: socket.id,
          onlineUsers: remainingUsers,
        };
        io.to(roomKey).emit('user-offline', offlinePayload);
      }
    });

    // ── Real-time Typing Indicator ──────────────────────────────────────────
    socket.on(
      'typing-status',
      (payload: { workspaceId: string; isTyping: boolean; filePath?: string }) => {
        const updatedPresence = this.presenceService.updateTypingStatus(
          socket.id,
          payload.isTyping,
          payload.filePath,
        );

        if (updatedPresence) {
          const roomKey = `workspace:${payload.workspaceId}`;
          const typingPayload: TypingStatusPayload = {
            workspaceId: payload.workspaceId,
            userId: updatedPresence.userId,
            socketId: socket.id,
            isTyping: payload.isTyping,
          };

          if (payload.filePath !== undefined) {
            typingPayload.filePath = payload.filePath;
          }

          socket.to(roomKey).emit('typing-status', typingPayload);
        }
      },
    );

    // ── Live Workspace Chat Message ─────────────────────────────────────────
    socket.on(
      'chat-message',
      (payload: {
        workspaceId?: string;
        roomCode?: string;
        message: string;
        user?: { id: string; displayName: string; username?: string; avatarUrl?: string };
      }) => {
        const roomKey = payload.workspaceId ? `workspace:${payload.workspaceId}` : payload.roomCode;
        if (!roomKey || !payload.message?.trim()) return;

        const chatPayload = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          workspaceId: payload.workspaceId || payload.roomCode,
          roomCode: payload.roomCode || payload.workspaceId,
          message: payload.message.trim(),
          user: payload.user || { id: socket.id, displayName: 'Developer', username: 'peer' },
          timestamp: new Date().toISOString(),
        };

        io.to(roomKey).emit('chat-message', chatPayload);
      },
    );

    // ── File/Folder Sync Notification ────────────────────────────────────────
    socket.on(
      'file-changed',
      (payload: { workspaceId?: string; roomCode?: string; action: string; fileName?: string }) => {
        const roomKey = payload.workspaceId ? `workspace:${payload.workspaceId}` : payload.roomCode;
        if (!roomKey) return;
        socket.to(roomKey).emit('file-changed', payload);
      },
    );

    // ── Socket Disconnect Handler ───────────────────────────────────────────
    socket.on('disconnect', () => {
      const { workspaceId, userId, remainingUsers } = this.presenceService.userLeft(socket.id);
      if (workspaceId && userId) {
        const roomKey = `workspace:${workspaceId}`;
        const offlinePayload: UserOfflinePayload = {
          workspaceId,
          userId,
          socketId: socket.id,
          onlineUsers: remainingUsers,
        };
        io.to(roomKey).emit('user-offline', offlinePayload);
      }
    });
  }

  /** Emit helper: broadcast role update event to workspace & targeted user */
  static notifyRoleUpdated(
    io: Server,
    workspaceId: string,
    targetUserId: string,
    newRole: WorkspaceRole,
    updatedBy: string,
  ): void {
    const payload: RoleUpdatedPayload = { workspaceId, userId: targetUserId, newRole, updatedBy };
    io.to(`workspace:${workspaceId}`).emit('role-updated', payload);
  }

  /** Emit helper: dispatch notification to specific user socket room */
  static notifyUser(
    io: Server,
    userId: string,
    notification: NotificationPayload['notification'],
  ): void {
    const payload: NotificationPayload = { notification };
    io.to(`user:${userId}`).emit('notification', payload);
  }

  /** Emit helper: dispatch activity update to workspace room */
  static notifyActivity(
    io: Server,
    workspaceId: string,
    activity: ActivityUpdatePayload['activity'],
  ): void {
    const payload: ActivityUpdatePayload = { workspaceId, activity };
    io.to(`workspace:${workspaceId}`).emit('activity-update', payload);
  }
}
