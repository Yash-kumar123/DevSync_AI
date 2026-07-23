import { Router } from 'express';
import { WorkspaceRepository } from './workspace.repository.js';
import { WorkspaceService } from './workspace.service.js';
import { WorkspaceController } from './workspace.controller.js';
import {
  CreateWorkspaceSchema,
  UpdateWorkspaceSchema,
  JoinWorkspaceSchema,
  validateBody,
} from './workspace.validator.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';

// =============================================================================
// DevSync AI — Workspace Routes
// All routes require JWT authentication (authenticate middleware).
// Mounted at: /api/v1/workspace (see src/routes/index.ts)
// =============================================================================

// Compose the dependency chain (manual DI)
const repository = new WorkspaceRepository();
const service = new WorkspaceService(repository);
const controller = new WorkspaceController(service);

export const workspaceRouter = Router();

// Apply JWT middleware to every workspace route
workspaceRouter.use(authenticate);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// POST   /api/v1/workspace/create  — create a new workspace
workspaceRouter.post('/create', validateBody(CreateWorkspaceSchema), controller.create);

// GET    /api/v1/workspace/my      — list the authenticated user's workspaces
// NOTE: /my must be declared BEFORE /:id so it isn't swallowed as a param
workspaceRouter.get('/my', controller.getMyWorkspaces);

// POST   /api/v1/workspace/join    — join via room code
workspaceRouter.post('/join', validateBody(JoinWorkspaceSchema), controller.join);

// GET    /api/v1/workspace/:id     — get a single workspace
workspaceRouter.get('/:id', controller.getById);

// PUT    /api/v1/workspace/:id     — update (owner only)
workspaceRouter.put('/:id', validateBody(UpdateWorkspaceSchema), controller.update);

// DELETE /api/v1/workspace/:id     — delete (owner only)
workspaceRouter.delete('/:id', controller.delete);
