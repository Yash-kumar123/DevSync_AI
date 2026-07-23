import type { Workspace, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';

// =============================================================================
// DevSync AI — Workspace Repository
// All database operations for workspaces. Follows the Repository pattern so
// the service layer stays free of ORM concerns.
// =============================================================================

// ---------------------------------------------------------------------------
// Interface (Dependency Inversion Principle)
// ---------------------------------------------------------------------------

export interface IWorkspaceRepository {
  create(data: Prisma.WorkspaceCreateInput): Promise<Workspace>;
  findById(id: string): Promise<WorkspaceWithOwner | null>;
  findByRoomCode(roomCode: string): Promise<WorkspaceWithOwner | null>;
  findByOwnerId(ownerId: string): Promise<WorkspaceWithOwner[]>;
  update(id: string, data: Prisma.WorkspaceUpdateInput): Promise<Workspace>;
  delete(id: string): Promise<void>;
  isRoomCodeTaken(roomCode: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Joined type used throughout the workspace feature
// ---------------------------------------------------------------------------

export type WorkspaceWithOwner = Workspace & {
  owner: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
};

// ---------------------------------------------------------------------------
// Prisma select fragment re-used across queries
// ---------------------------------------------------------------------------

const ownerSelect = {
  id: true,
  displayName: true,
  username: true,
  avatarUrl: true,
} as const;

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class WorkspaceRepository implements IWorkspaceRepository {
  /** Create a new workspace row. */
  async create(data: Prisma.WorkspaceCreateInput): Promise<Workspace> {
    return prisma.workspace.create({ data });
  }

  /** Find a workspace by its primary key, include owner info. */
  async findById(id: string): Promise<WorkspaceWithOwner | null> {
    return prisma.workspace.findUnique({
      where: { id },
      include: { owner: { select: ownerSelect } },
    });
  }

  /** Find a workspace by its unique room code, include owner info. */
  async findByRoomCode(roomCode: string): Promise<WorkspaceWithOwner | null> {
    return prisma.workspace.findUnique({
      where: { roomCode },
      include: { owner: { select: ownerSelect } },
    });
  }

  /** Return all workspaces owned by a given user, newest first. */
  async findByOwnerId(ownerId: string): Promise<WorkspaceWithOwner[]> {
    return prisma.workspace.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: ownerSelect } },
    });
  }

  /** Partially update a workspace. */
  async update(id: string, data: Prisma.WorkspaceUpdateInput): Promise<Workspace> {
    return prisma.workspace.update({ where: { id }, data });
  }

  /** Hard-delete a workspace by id. */
  async delete(id: string): Promise<void> {
    await prisma.workspace.delete({ where: { id } });
  }

  /** Check whether a room code is already in use (for uniqueness validation). */
  async isRoomCodeTaken(roomCode: string): Promise<boolean> {
    const count = await prisma.workspace.count({ where: { roomCode } });
    return count > 0;
  }
}
