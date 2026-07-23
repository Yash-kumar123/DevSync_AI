import { prisma } from '../../../config/prisma.js';
import type { LogService, LogLevel } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Admin Repository
// Data access layer for system metrics, user lists, workspace audits,
// and log aggregations using Prisma ORM.
// =============================================================================

export class AdminRepository {
  /** Get overview counts and statistics. */
  async getDashboardCounts(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalWorkspaces: number;
    activeWorkspaces: number;
    storageUsageBytes: number;
  }> {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({ where: { isActive: true } });
    const totalWorkspaces = await prisma.workspace.count();

    // Active workspaces: created or updated within last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeWorkspaces = await prisma.workspace.count({
      where: { updatedAt: { gte: sevenDaysAgo } },
    });

    // Sum file contents size for total storage usage
    const files = await prisma.file.findMany({
      select: { content: true },
    });

    const storageUsageBytes = files.reduce(
      (acc, f) => acc + (f.content ? Buffer.byteLength(f.content, 'utf8') : 0),
      0,
    );

    return {
      totalUsers,
      activeUsers,
      totalWorkspaces,
      activeWorkspaces,
      storageUsageBytes,
    };
  }

  /** Query system logs with search, service filter, level filter, and pagination. */
  async getSystemLogs(params: {
    page: number;
    limit: number;
    service?: LogService | undefined;
    level?: LogLevel | undefined;
    search?: string | undefined;
  }) {
    const { page, limit, service, level, search } = params;
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (service) {
      whereClause['service'] = service;
    }
    if (level) {
      whereClause['level'] = level;
    }
    if (search && search.trim().length > 0) {
      whereClause['message'] = { contains: search.trim(), mode: 'insensitive' };
    }

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where: whereClause,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.systemLog.count({ where: whereClause }),
    ]);

    return { logs, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Query users for admin table with search, role filter, and pagination. */
  async getUsers(params: {
    page: number;
    limit: number;
    role?: string | undefined;
    search?: string | undefined;
  }) {
    const { page, limit, role, search } = params;
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (role) {
      whereClause['role'] = role;
    }
    if (search && search.trim().length > 0) {
      whereClause['OR'] = [
        { displayName: { contains: search.trim(), mode: 'insensitive' } },
        { email: { contains: search.trim(), mode: 'insensitive' } },
        { username: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          avatarUrl: true,
          displayName: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Query workspaces for admin table. */
  async getWorkspaces(params: { page: number; limit: number; search?: string | undefined }) {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const whereClause: Record<string, unknown> = {};

    if (search && search.trim().length > 0) {
      whereClause['OR'] = [
        { name: { contains: search.trim(), mode: 'insensitive' } },
        { roomCode: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [workspaces, total] = await Promise.all([
      prisma.workspace.findMany({
        where: whereClause,
        include: {
          owner: {
            select: { id: true, displayName: true, email: true },
          },
          _count: {
            select: { members: true, files: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.workspace.count({ where: whereClause }),
    ]);

    return { workspaces, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Create a system log record. */
  async createLog(
    service: LogService,
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
  ) {
    return prisma.systemLog.create({
      data: {
        service,
        level,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  }
}
