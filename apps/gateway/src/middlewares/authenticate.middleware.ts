import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { createHttpError } from '../utils/http-error.js';

// =============================================================================
// DevSync AI — Authenticate Middleware
// Verifies the JWT access token from the Authorization header.
// On success: attaches `req.user` and calls `next()`.
// On failure: forwards an HttpError to the centralized error handler.
// =============================================================================

interface AccessTokenPayload {
  sub: string;
  email: string;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(createHttpError('Authentication required. Please provide a valid Bearer token.', 401));
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AccessTokenPayload;

    // Attach the decoded user to the request for downstream handlers
    req.user = {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      // UserRole is a string enum — cast from the JWT payload string
      role: payload.role as 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER',
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(createHttpError('Access token has expired. Please refresh your session.', 401));
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(createHttpError('Invalid access token.', 401));
    } else {
      next(createHttpError('Authentication failed.', 401));
    }
  }
}
