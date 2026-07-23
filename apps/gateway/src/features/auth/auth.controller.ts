import type { Request, Response, NextFunction } from 'express';
import type { AuthService } from './auth.service.js';

// =============================================================================
// DevSync AI — Auth Controller
// Thin layer: parse request → call service → format response.
// No business logic lives here.
// =============================================================================

// Cookie configuration for the HttpOnly refresh token
const REFRESH_COOKIE_NAME = 'devsync_refresh_token';

function refreshCookieOptions(maxAgeMs?: number) {
  return {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict' as const,
    path: '/api/v1/auth',
    maxAge: maxAgeMs ?? 7 * 24 * 60 * 60 * 1000, // 7 days default
  };
}

export class AuthController {
  constructor(private readonly service: AuthService) {}

  // POST /api/v1/auth/register
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.register(req.body);

      res.cookie(REFRESH_COOKIE_NAME, result.tokens.refreshToken, refreshCookieOptions());

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresAt: result.tokens.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/auth/login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.login(req.body);

      res.cookie(REFRESH_COOKIE_NAME, result.tokens.refreshToken, refreshCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Logged in successfully.',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresAt: result.tokens.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/auth/refresh
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = (req.cookies as Record<string, string | undefined>)[
        REFRESH_COOKIE_NAME
      ];

      if (!rawRefreshToken) {
        res.status(401).json({
          success: false,
          error: { code: 'NO_REFRESH_TOKEN', message: 'No refresh token provided.' },
        });
        return;
      }

      const result = await this.service.refreshTokens(rawRefreshToken);

      // Rotate cookie
      res.cookie(REFRESH_COOKIE_NAME, result.tokens.refreshToken, refreshCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Tokens refreshed.',
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresAt: result.tokens.expiresAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/auth/logout
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = (req.cookies as Record<string, string | undefined>)[
        REFRESH_COOKIE_NAME
      ];

      if (rawRefreshToken) {
        await this.service.logout(rawRefreshToken);
      }

      // Clear the HttpOnly cookie
      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/auth/me  (protected route — requires authenticate middleware)
  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' },
        });
        return;
      }

      const user = await this.service.getMe(req.user.id);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  };
}
