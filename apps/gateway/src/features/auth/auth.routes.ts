import { Router } from 'express';
import { AuthRepository } from './auth.repository.js';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { RegisterSchema, LoginSchema, validateBody } from './auth.validator.js';
import { authenticate } from '../../middlewares/authenticate.middleware.js';

// =============================================================================
// DevSync AI — Auth Routes
// Wires together: validator → controller → service → repository
// Mounted at: /api/v1/auth (see src/routes/index.ts)
// =============================================================================

// Compose the dependency chain (manual DI — no container needed at this scale)
const repository = new AuthRepository();
const service = new AuthService(repository);
const controller = new AuthController(service);

export const authRouter = Router();

// Public routes ---------------------------------------------------------------
authRouter.post('/register', validateBody(RegisterSchema), controller.register);
authRouter.post('/login', validateBody(LoginSchema), controller.login);
authRouter.post('/refresh', controller.refresh);
authRouter.post('/logout', controller.logout);

// Protected routes ------------------------------------------------------------
authRouter.get('/me', authenticate, controller.getMe);
