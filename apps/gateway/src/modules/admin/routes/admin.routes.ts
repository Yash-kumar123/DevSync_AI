import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { authenticate } from '../../../middlewares/authenticate.middleware.js';

// =============================================================================
// DevSync AI — Admin Express Router
// Routes for Dashboard Statistics, System Monitoring, Logs Viewer,
// Users & Workspace Telemetry, and Admin Settings.
// =============================================================================

export const adminRouter = Router();
const controller = new AdminController();

// Apply authentication middleware to all admin endpoints
adminRouter.use(authenticate);

adminRouter.get('/stats', controller.getDashboardStats);
adminRouter.get('/monitoring', controller.getSystemHealth);
adminRouter.get('/ai-analytics', controller.getAIAnalytics);
adminRouter.get('/logs', controller.getLogs);
adminRouter.get('/users', controller.getUsers);
adminRouter.get('/workspaces', controller.getWorkspaces);
adminRouter.get('/settings', controller.getSettings);
