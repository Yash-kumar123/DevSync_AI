import crypto from 'node:crypto';
import { createHttpError } from '../../utils/http-error.js';
import type { IWorkspaceRepository, WorkspaceWithOwner } from './workspace.repository.js';
import type {
  CreateWorkspaceBody,
  UpdateWorkspaceBody,
  JoinWorkspaceBody,
} from './workspace.validator.js';

// =============================================================================
// DevSync AI — Workspace Service
// Orchestrates workspace business logic.
// Never touches Express request/response — that is the controller's job.
// =============================================================================

// ---------------------------------------------------------------------------
// Room code generation
// ---------------------------------------------------------------------------

/**
 * Generate a random alphanumeric room code (e.g. "A3FX91").
 * Length: 8 chars, uppercase letters + digits.
 */
function generateRoomCode(): string {
  return crypto
    .randomBytes(6)
    .toString('base64url')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
    .padEnd(8, '0');
}

// ---------------------------------------------------------------------------
// Service class
// ---------------------------------------------------------------------------

export class WorkspaceService {
  constructor(private readonly repo: IWorkspaceRepository) {}

  // ── Create ────────────────────────────────────────────────────────────────

  /**
   * Create a new workspace for the authenticated user.
   * Generates a unique room code automatically (with collision retry).
   */
  async create(ownerId: string, body: CreateWorkspaceBody): Promise<WorkspaceWithOwner> {
    // Generate a unique room code (retry up to 5 times on collision)
    let roomCode: string;
    let attempts = 0;
    do {
      roomCode = generateRoomCode();
      attempts++;
      if (attempts > 5)
        throw createHttpError('Failed to generate a unique room code. Please try again.', 500);
    } while (await this.repo.isRoomCodeTaken(roomCode));

    const workspace = await this.repo.create({
      name: body.name.trim(),
      // Prisma expects null (not undefined) for optional nullable fields
      description: body.description?.trim() ?? null,
      roomCode,
      owner: { connect: { id: ownerId } },
    });

    // Return with owner info
    const created = await this.repo.findById(workspace.id);
    if (!created) throw createHttpError('Workspace creation failed.', 500);
    return created;
  }

  // ── Get my workspaces ─────────────────────────────────────────────────────

  /** Return all workspaces owned by the authenticated user. */
  async getMyWorkspaces(ownerId: string): Promise<WorkspaceWithOwner[]> {
    return this.repo.findByOwnerId(ownerId);
  }

  // ── Get by ID ─────────────────────────────────────────────────────────────

  /** Fetch a single workspace by id. Throws 404 if not found. */
  async getById(id: string): Promise<WorkspaceWithOwner> {
    const workspace = await this.repo.findById(id);
    if (!workspace) throw createHttpError('Workspace not found.', 404);
    return workspace;
  }

  // ── Update ────────────────────────────────────────────────────────────────

  /**
   * Update a workspace. Only the owner can do this.
   */
  async update(
    id: string,
    requesterId: string,
    body: UpdateWorkspaceBody,
  ): Promise<WorkspaceWithOwner> {
    const workspace = await this.repo.findById(id);
    if (!workspace) throw createHttpError('Workspace not found.', 404);
    if (workspace.ownerId !== requesterId) {
      throw createHttpError('Only the workspace owner can update it.', 403);
    }

    const updateData: { name?: string; description?: string } = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();

    await this.repo.update(id, updateData);

    const updated = await this.repo.findById(id);
    if (!updated) throw createHttpError('Workspace update failed.', 500);
    return updated;
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  /**
   * Delete a workspace. Only the owner can do this.
   */
  async delete(id: string, requesterId: string): Promise<void> {
    const workspace = await this.repo.findById(id);
    if (!workspace) throw createHttpError('Workspace not found.', 404);
    if (workspace.ownerId !== requesterId) {
      throw createHttpError('Only the workspace owner can delete it.', 403);
    }
    await this.repo.delete(id);
  }

  // ── Join ──────────────────────────────────────────────────────────────────

  /**
   * Resolve a workspace by its room code.
   * In the future this will add the user as a member; for now it just
   * returns the workspace details so the frontend can navigate to it.
   */
  async joinByRoomCode(body: JoinWorkspaceBody): Promise<WorkspaceWithOwner> {
    const workspace = await this.repo.findByRoomCode(body.roomCode.trim().toUpperCase());
    if (!workspace) {
      throw createHttpError(
        'No workspace found with that room code. Please check and try again.',
        404,
      );
    }
    return workspace;
  }
}
