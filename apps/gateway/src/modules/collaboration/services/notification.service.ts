import { prisma } from '../../../config/prisma.js';
import type { NotificationDTO } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Notification Service
// Handles creation, querying, and updating user notifications.
// =============================================================================

export class NotificationService {
  /** Create a notification for a user. */
  async createNotification(
    userId: string,
    type: 'INVITATION' | 'WORKSPACE_EVENT' | 'MEMBER_JOIN' | 'MEMBER_LEAVE' | 'ROLE_CHANGE',
    title: string,
    message: string,
    workspaceId?: string,
    payload?: Record<string, unknown>,
  ): Promise<NotificationDTO> {
    const notification = await prisma.notification.create({
      data: {
        userId,
        workspaceId: workspaceId ?? null,
        type,
        title,
        message,
        payload: payload ? JSON.stringify(payload) : null,
      },
    });

    return this.toDTO(notification);
  }

  /** Retrieve all notifications for a specific user. */
  async getUserNotifications(userId: string, limit = 50): Promise<NotificationDTO[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return notifications.map((n) => this.toDTO(n));
  }

  /** Mark a single notification as read. */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationDTO | null> {
    const notification = await prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });

    if (!notification) return null;

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return this.toDTO(updated);
  }

  /** Mark all notifications for a user as read. */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return result.count;
  }

  private toDTO(notification: {
    id: string;
    userId: string;
    workspaceId: string | null;
    type: string;
    title: string;
    message: string;
    payload: string | null;
    read: boolean;
    createdAt: Date;
  }): NotificationDTO {
    let parsedPayload: Record<string, unknown> | null = null;
    if (notification.payload) {
      try {
        parsedPayload = JSON.parse(notification.payload);
      } catch {
        parsedPayload = { raw: notification.payload };
      }
    }

    return {
      id: notification.id,
      userId: notification.userId,
      workspaceId: notification.workspaceId,
      type: notification.type as NotificationDTO['type'],
      title: notification.title,
      message: notification.message,
      payload: parsedPayload,
      read: notification.read,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
