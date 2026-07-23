import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFoundHandler } from './middlewares/not-found.middleware.js';
import { apiRouter } from './routes/index.js';

// =============================================================================
// DevSync AI — Express Application Factory
// Creates and configures the Express app without starting the HTTP server.
// Separation of app creation from server.listen() enables easier testing.
// =============================================================================

export function createApp() {
  const app = express();

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors(corsOptions));

  // ── Logging ───────────────────────────────────────────────────────────────
  app.use(morgan('dev'));

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ── Cookie parsing (needed for HttpOnly refresh token) ───────────────────
  app.use(cookieParser());

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ── Error handling (must be last) ─────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
