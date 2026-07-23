import type { User, RefreshToken, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';

// =============================================================================
// DevSync AI — Auth Repository
// Responsible for ALL database operations related to authentication.
// Follows the Repository pattern so the service layer stays free of ORM concerns.
// =============================================================================

// ---------------------------------------------------------------------------
// Interface (Dependency Inversion Principle)
// ---------------------------------------------------------------------------

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  findUserByUsername(username: string): Promise<User | null>;
  createUser(data: Prisma.UserCreateInput): Promise<User>;
  createRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<RefreshToken>;
  findRefreshToken(tokenHash: string): Promise<(RefreshToken & { user: User }) | null>;
  deleteRefreshToken(tokenHash: string): Promise<void>;
  deleteAllRefreshTokensForUser(userId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class AuthRepository implements IAuthRepository {
  /** Find a user by email address (case-insensitive via lower-casing). */
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /** Find a user by their primary key (CUID). */
  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /** Find a user by their unique username. */
  async findUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
  }

  /** Create a new user row. Caller is responsible for hashing the password. */
  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  /** Persist a hashed refresh token for a given user. */
  async createRefreshToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  /**
   * Look up a refresh token by its hash and eagerly load the owning user.
   * Used during token rotation and logout.
   */
  async findRefreshToken(tokenHash: string): Promise<(RefreshToken & { user: User }) | null> {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  /** Remove a single refresh token (logout from one device). */
  async deleteRefreshToken(tokenHash: string): Promise<void> {
    await prisma.refreshToken.delete({ where: { tokenHash } }).catch(() => {
      // Token may already be deleted — silently ignore.
    });
  }

  /** Remove ALL refresh tokens for a user (logout from all devices). */
  async deleteAllRefreshTokensForUser(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  }
}
