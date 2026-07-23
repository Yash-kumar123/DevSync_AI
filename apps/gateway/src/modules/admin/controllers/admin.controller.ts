import type { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import type { LogService, LogLevel } from '@devsync/shared-types';

// =============================================================================
// DevSync AI — Admin Controller
// Route handlers for Admin Dashboard, Telemetry, Monitoring, Logs, and Settings.
// =============================================================================

function parseParam(param: unknown): string {
  if (Array.isArray(param)) return (param[0] as string) ?? '';
  if (typeof param === 'string') return param;
  return '';
}

export class AdminController {
  constructor(private readonly adminService: AdminService = new AdminService()) {}

  /** GET /api/v1/admin/stats */
  getDashboardStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.adminService.getDashboardStats();
      res.json({ success: true, stats });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/admin/monitoring */
  getSystemHealth = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const health = await this.adminService.getSystemHealth();
      res.json({ success: true, health });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/admin/ai-analytics */
  getAIAnalytics = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const analytics = await this.adminService.getAIAnalytics();
      res.json({ success: true, analytics });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/admin/logs */
  getLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(parseParam(req.query['page']) || '1', 10);
      const limit = parseInt(parseParam(req.query['limit']) || '20', 10);
      const service = parseParam(req.query['service']) as LogService | undefined;
      const level = parseParam(req.query['level']) as LogLevel | undefined;
      const search = parseParam(req.query['search']);

      const logsData = await this.adminService.getLogs({
        page,
        limit,
        service: service || undefined,
        level: level || undefined,
        search: search || undefined,
      });

      res.json({ success: true, ...logsData });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/admin/users */
  getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(parseParam(req.query['page']) || '1', 10);
      const limit = parseInt(parseParam(req.query['limit']) || '10', 10);
      const role = parseParam(req.query['role']);
      const search = parseParam(req.query['search']);

      const usersData = await this.adminService.getUsers({
        page,
        limit,
        role: role || undefined,
        search: search || undefined,
      });

      res.json({ success: true, ...usersData });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/admin/workspaces */
  getWorkspaces = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(parseParam(req.query['page']) || '1', 10);
      const limit = parseInt(parseParam(req.query['limit']) || '10', 10);
      const search = parseParam(req.query['search']);

      const workspacesData = await this.adminService.getWorkspaces({
        page,
        limit,
        search: search || undefined,
      });

      res.json({ success: true, ...workspacesData });
    } catch (err) {
      next(err);
    }
  };

  /** GET /api/v1/admin/settings */
  getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = this.adminService.getSettings();
      res.json({ success: true, settings });
    } catch (err) {
      next(err);
    }
  };
}
