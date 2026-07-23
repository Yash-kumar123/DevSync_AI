import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

// =============================================================================
// DevSync AI — Workspace Validators
// Zod schemas for workspace request payloads.
// =============================================================================

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const CreateWorkspaceSchema = z.object({
  name: z
    .string({ required_error: 'Workspace name is required.' })
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name must be at most 80 characters.'),

  description: z.string().max(500, 'Description must be at most 500 characters.').optional(),
});

export const UpdateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters.')
    .max(80, 'Name must be at most 80 characters.')
    .optional(),

  description: z.string().max(500, 'Description must be at most 500 characters.').optional(),
});

export const JoinWorkspaceSchema = z.object({
  roomCode: z
    .string({ required_error: 'Room code is required.' })
    .min(6, 'Room code must be at least 6 characters.')
    .max(12, 'Room code must be at most 12 characters.'),
});

// ---------------------------------------------------------------------------
// Inferred types (used by service layer)
// ---------------------------------------------------------------------------

export type CreateWorkspaceBody = z.infer<typeof CreateWorkspaceSchema>;
export type UpdateWorkspaceBody = z.infer<typeof UpdateWorkspaceSchema>;
export type JoinWorkspaceBody = z.infer<typeof JoinWorkspaceSchema>;

// ---------------------------------------------------------------------------
// Middleware factory
// ---------------------------------------------------------------------------

/**
 * Returns Express middleware that validates `req.body` against the given
 * Zod schema. Replaces body with parsed/coerced data on success.
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data as z.infer<T>;
    next();
  };
}
