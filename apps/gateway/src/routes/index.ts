import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from '../features/auth/auth.routes.js';
import { workspaceRouter } from '../features/workspace/workspace.routes.js';
import { folderRouter, fileRouter } from '../features/filesystem/filesystem.routes.js';
import { terminalRouter } from '../features/terminal/terminal.routes.js';
import { gitRouter } from '../features/git/git.routes.js';
import { collaborationRouter } from '../modules/collaboration/routes/collaboration.routes.js';
import { adminRouter } from '../modules/admin/routes/admin.routes.js';

// =============================================================================
// DevSync AI — API Router
// All feature routers are mounted here under /api (see app.ts).
// =============================================================================

export const apiRouter = Router();

// Health check — GET /api/health
apiRouter.use('/health', healthRouter);

// Authentication — POST /api/v1/auth/register, /login, /refresh, /logout
//               — GET  /api/v1/auth/me
apiRouter.use('/v1/auth', authRouter);

// Admin Dashboard, Monitoring, & Telemetry — /api/v1/admin
apiRouter.use('/v1/admin', adminRouter);
apiRouter.use('/admin', adminRouter);

// Workspace management — all /api/v1/workspace/* & /api/v1/workspaces/* routes
apiRouter.use('/v1/workspace', workspaceRouter);
apiRouter.use('/v1/workspaces', workspaceRouter);

// Collaboration & Presence — /api/v1/collaboration & root /api/v1 endpoints
apiRouter.use('/v1/collaboration', collaborationRouter);
apiRouter.use('/v1', collaborationRouter);

// File System management — /api/v1/folders & /api/v1/files
apiRouter.use('/v1/folders', folderRouter);
apiRouter.use('/v1/files', fileRouter);

// Terminal & Code Execution — /api/v1/terminal
apiRouter.use('/v1/terminal', terminalRouter);

// Git Integration & Source Control — /api/v1/git
apiRouter.use('/v1/git', gitRouter);

// Direct root endpoint compatibility
apiRouter.use('/folders', folderRouter);
apiRouter.use('/files', fileRouter);
apiRouter.use('/terminal', terminalRouter);
apiRouter.use('/git', gitRouter);
