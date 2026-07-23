import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

// =============================================================================
// DevSync AI — Auth Validators
// Zod schemas for request payload validation.
// Middleware factory that validates and replaces req.body with the parsed result.
// =============================================================================

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const RegisterSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please enter a valid email address.')
    .max(255, 'Email must be at most 255 characters.'),

  username: z
    .string({ required_error: 'Username is required.' })
    .min(3, 'Username must be at least 3 characters.')
    .max(30, 'Username must be at most 30 characters.')
    .regex(
      /^[a-z0-9_-]+$/i,
      'Username may only contain letters, numbers, hyphens, and underscores.',
    ),

  displayName: z
    .string({ required_error: 'Display name is required.' })
    .min(2, 'Display name must be at least 2 characters.')
    .max(50, 'Display name must be at most 50 characters.'),

  password: z
    .string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters.')
    .max(128, 'Password must be at most 128 characters.')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    ),
});

export const LoginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please enter a valid email address.'),

  password: z.string({ required_error: 'Password is required.' }).min(1, 'Password is required.'),
});

// ---------------------------------------------------------------------------
// Inferred types (used by service layer)
// ---------------------------------------------------------------------------

export type RegisterBody = z.infer<typeof RegisterSchema>;
export type LoginBody = z.infer<typeof LoginSchema>;

// ---------------------------------------------------------------------------
// Middleware factory
// ---------------------------------------------------------------------------

/**
 * Creates an Express middleware that validates `req.body` against the given
 * Zod schema. On success, replaces `req.body` with the parsed (and coerced)
 * value. On failure, passes a structured error to `next()`.
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Pass to the centralized error handler (which handles ZodError)
      next(result.error);
      return;
    }
    req.body = result.data as z.infer<T>;
    next();
  };
}
