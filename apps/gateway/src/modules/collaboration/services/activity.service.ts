import { prisma } from '../../../config/prisma.js';
import type { ActivityAction, ActivityLogDTO } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Activity History Service
// Logs workspace audit timeline events and retrieves activity history.
// =============================================================================

export class ActivityService {
  /** Log an activity action for a workspace. */
  async logActivity(
    workspaceId: string,
    userId: string,
    action: ActivityAction,
    details?: string | Record<string, unknown>,
  ): Promise<ActivityLogDTO> {
    const detailsString = typeof details === 'object' ? JSON.stringify(details) : details;

    const log = await prisma.activityLog.create({
      data: {
        workspaceId,
        userId,
        action,
        details: detailsString ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      id: log.id,
      workspaceId: log.workspaceId,
      userId: log.userId,
      action: log.action as ActivityAction,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
      user: log.user,
    };
  }

  /** Get activity log timeline for a workspace. */
  async getWorkspaceActivities(workspaceId: string, limit = 50): Promise<ActivityLogDTO[]> {
    const logs = await prisma.activityLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      workspaceId: log.workspaceId,
      userId: log.userId,
      action: log.action as ActivityAction,
      details: log.details,
      createdAt: log.createdAt.toISOString(),
      user: log.user,
    }));
  }
}
