import { prisma } from '../config/prisma.js';

// =============================================================================
// DevSync AI — Workspace Resolver Utility
// Resolves a given workspace identifier (which can be a Workspace CUID ID or
// a Room Code like "LL7ZL4A9") to a valid, persistent Workspace database ID.
// If no matching workspace exists, automatically creates a fallback workspace.
// =============================================================================

export async function resolveWorkspaceId(workspaceIdOrRoomCode: string): Promise<string> {
  const target = workspaceIdOrRoomCode?.trim();
  if (!target) {
    throw new Error('Workspace ID or Room Code is required');
  }

  // 1. Check if target matches a Workspace primary key ID
  const existingById = await prisma.workspace.findUnique({
    where: { id: target },
    select: { id: true },
  });
  if (existingById) {
    return existingById.id;
  }

  // 2. Check if target matches a Workspace roomCode
  const existingByRoom = await prisma.workspace.findUnique({
    where: { roomCode: target },
    select: { id: true },
  });
  if (existingByRoom) {
    return existingByRoom.id;
  }

  // 3. Fallback: Find or create a system/default user to own the workspace
  let owner = await prisma.user.findFirst({
    select: { id: true },
  });

  if (!owner) {
    owner = await prisma.user.create({
      data: {
        email: 'workspace-owner@devsync.ai',
        username: 'devsync_system_user',
        displayName: 'DevSync User',
        passwordHash: '$2b$10$wN9P3B0x7n7S9wz8LqZ.e.1234567890abcdef',
      },
      select: { id: true },
    });
  }

  // 4. Auto-create the workspace row for this roomCode
  const createdWorkspace = await prisma.workspace.create({
    data: {
      name: `Workspace ${target}`,
      roomCode: target,
      ownerId: owner.id,
    },
    select: { id: true },
  });

  return createdWorkspace.id;
}
