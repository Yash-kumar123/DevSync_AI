import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { User } from '@prisma/client';
import { env } from '../../config/env.js';
import { createHttpError } from '../../utils/http-error.js';
import type { IAuthRepository } from './auth.repository.js';
import type { RegisterBody, LoginBody } from './auth.validator.js';

// =============================================================================
// DevSync AI — Auth Service
// Orchestrates authentication business logic.
// Never touches Express request/response — that is the controller's job.
// =============================================================================

// ---------------------------------------------------------------------------
// Types returned to the controller
// ---------------------------------------------------------------------------

/** User data safe to expose in API responses (no passwordHash). */
export interface SafeUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp in ms when the ACCESS token expires
}

export interface AuthResult {
  user: SafeUser;
  tokens: AuthTokenPair;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BCRYPT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip passwordHash and return only safe user fields. */
function sanitizeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/** Sign a JWT access token (short-lived). */
function signAccessToken(
  userId: string,
  email: string,
  username: string,
  role: string,
): { token: string; expiresAt: number } {
  const expiresIn = env.jwtAccessExpiresIn;
  // Calculate approximate expiry (ms) for the client
  const expiresAt = Date.now() + parseExpiresInMs(expiresIn);
  const token = jwt.sign({ sub: userId, email, username, role }, env.jwtAccessSecret, {
    expiresIn,
  } as jwt.SignOptions);
  return { token, expiresAt };
}

/** Sign a JWT refresh token (long-lived). */
function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn,
  } as jwt.SignOptions);
}

/** Convert an expires-in string like "15m" or "7d" to milliseconds. */
function parseExpiresInMs(expiresIn: string): number {
  const match = /^(\d+)([smhd])$/.exec(expiresIn);
  if (!match) return 15 * 60 * 1000; // default 15m
  const [, num, unit] = match;
  const n = Number(num);
  const multipliers: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * (multipliers[unit ?? 'm'] ?? 60_000);
}

/** SHA-256 hash of the raw refresh token for safe DB storage. */
function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/** Calculate the Date when the refresh token expires (for DB storage). */
function refreshTokenExpiryDate(): Date {
  const ms = parseExpiresInMs(env.jwtRefreshExpiresIn);
  return new Date(Date.now() + ms);
}

// ---------------------------------------------------------------------------
// Service class
// ---------------------------------------------------------------------------

export class AuthService {
  constructor(private readonly repo: IAuthRepository) {}

  // -------------------------------------------------------------------------
  // Register
  // -------------------------------------------------------------------------

  /**
   * Creates a new user account.
   * Checks email and username uniqueness, hashes password, and returns tokens.
   */
  async register(body: RegisterBody): Promise<AuthResult> {
    const email = body.email.toLowerCase().trim();
    const username = body.username.toLowerCase().trim();

    // Uniqueness checks
    const [existingByEmail, existingByUsername] = await Promise.all([
      this.repo.findUserByEmail(email),
      this.repo.findUserByUsername(username),
    ]);

    if (existingByEmail) {
      throw createHttpError('An account with this email already exists.', 409);
    }
    if (existingByUsername) {
      throw createHttpError('This username is already taken.', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, BCRYPT_ROUNDS);

    // Create user
    const user = await this.repo.createUser({
      email,
      username,
      displayName: body.displayName.trim(),
      passwordHash,
    });

    return this._issueTokensAndPersist(user);
  }

  // -------------------------------------------------------------------------
  // Login
  // -------------------------------------------------------------------------

  /**
   * Validates credentials and returns a fresh token pair.
   */
  async login(body: LoginBody): Promise<AuthResult> {
    const email = body.email.toLowerCase().trim();
    const user = await this.repo.findUserByEmail(email);

    // Use constant-time comparison to prevent timing attacks even when user is null
    const passwordHash =
      user?.passwordHash ?? '$2a$12$invalidhashplaceholderXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const passwordMatch = await bcrypt.compare(body.password, passwordHash);

    if (!user || !passwordMatch) {
      throw createHttpError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw createHttpError('This account has been deactivated.', 403);
    }

    return this._issueTokensAndPersist(user);
  }

  // -------------------------------------------------------------------------
  // Refresh Tokens
  // -------------------------------------------------------------------------

  /**
   * Rotates the refresh token — invalidates the old one and issues a new pair.
   * Implements refresh token rotation for security.
   */
  async refreshTokens(rawRefreshToken: string): Promise<AuthResult> {
    // Verify the JWT signature first
    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(rawRefreshToken, env.jwtRefreshSecret) as jwt.JwtPayload;
    } catch {
      throw createHttpError('Invalid or expired refresh token.', 401);
    }

    const userId = payload['sub'] as string | undefined;
    if (!userId) throw createHttpError('Invalid refresh token payload.', 401);

    // Check the hashed token exists in the DB (detects stolen/reused tokens)
    const tokenHash = hashToken(rawRefreshToken);
    const storedToken = await this.repo.findRefreshToken(tokenHash);

    if (!storedToken || storedToken.userId !== userId) {
      // Possible token reuse attack — revoke ALL tokens for this user
      await this.repo.deleteAllRefreshTokensForUser(userId);
      throw createHttpError('Refresh token reuse detected. Please log in again.', 401);
    }

    if (storedToken.expiresAt < new Date()) {
      await this.repo.deleteRefreshToken(tokenHash);
      throw createHttpError('Refresh token has expired. Please log in again.', 401);
    }

    // Rotate: delete old token and issue new pair
    await this.repo.deleteRefreshToken(tokenHash);
    return this._issueTokensAndPersist(storedToken.user);
  }

  // -------------------------------------------------------------------------
  // Logout
  // -------------------------------------------------------------------------

  /**
   * Revokes the provided refresh token (single-device logout).
   */
  async logout(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashToken(rawRefreshToken);
    await this.repo.deleteRefreshToken(tokenHash);
  }

  // -------------------------------------------------------------------------
  // Get current user
  // -------------------------------------------------------------------------

  /**
   * Returns the sanitized profile of the authenticated user.
   */
  async getMe(userId: string): Promise<SafeUser> {
    const user = await this.repo.findUserById(userId);
    if (!user) throw createHttpError('User not found.', 404);
    return sanitizeUser(user);
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Signs a new access/refresh token pair and persists the hashed refresh token.
   */
  private async _issueTokensAndPersist(user: User): Promise<AuthResult> {
    const { token: accessToken, expiresAt } = signAccessToken(
      user.id,
      user.email,
      user.username,
      user.role,
    );
    const rawRefreshToken = signRefreshToken(user.id);
    const tokenHash = hashToken(rawRefreshToken);
    const expiryDate = refreshTokenExpiryDate();

    await this.repo.createRefreshToken(user.id, tokenHash, expiryDate);

    return {
      user: sanitizeUser(user),
      tokens: {
        accessToken,
        refreshToken: rawRefreshToken,
        expiresAt,
      },
    };
  }
}
