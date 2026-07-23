import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env.js';

// =============================================================================
// DevSync AI — Centralized Error Handler
// Handles HttpError, ZodError, PrismaClientKnownRequestError, and unknown errors.
// Must be the LAST middleware registered in app.ts.
// =============================================================================

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  // ── Zod Validation Error ─────────────────────────────────────────────────
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || 'root';
      if (!details[key]) details[key] = [];
      details[key]!.push(issue.message);
    }

    response.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        details,
      },
    });
    return;
  }

  // ── Prisma Known Request Error ───────────────────────────────────────────
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 = Unique constraint violation
    if (error.code === 'P2002') {
      const fields = (error.meta?.['target'] as string[] | undefined) ?? [];
      response.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `A record with the same ${fields.join(', ')} already exists.`,
        },
      });
      return;
    }

    // P2025 = Record not found
    if (error.code === 'P2025') {
      response.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'The requested resource was not found.' },
      });
      return;
    }

    response.status(400).json({
      success: false,
      error: { code: 'DATABASE_ERROR', message: 'A database error occurred.' },
    });
    return;
  }

  // ── HTTP Error (from createHttpError utility) ────────────────────────────
  const statusCode =
    typeof (error as { statusCode?: number }).statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : 500;

  response.status(statusCode).json({
    success: false,
    error: {
      code: statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'HTTP_ERROR',
      message: statusCode === 500 ? 'An unexpected error occurred.' : (error as Error).message,
    },
    // Include stack trace in development for easier debugging
    ...(env.nodeEnv === 'development' && { stack: (error as Error).stack }),
  });
};
