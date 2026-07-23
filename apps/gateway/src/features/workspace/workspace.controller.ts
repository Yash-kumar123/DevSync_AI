import type { Request, Response, NextFunction } from 'express';
import type { WorkspaceService } from './workspace.service.js';

// =============================================================================
// DevSync AI — Workspace Controller
// Thin layer: parse request → call service → format response.
// No business logic here.
// =============================================================================

export class WorkspaceController {
  constructor(private readonly service: WorkspaceService) {}

  // POST /api/v1/workspace/create
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspace = await this.service.create(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Workspace created successfully.',
        data: { workspace },
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/workspace/my
  getMyWorkspaces = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspaces = await this.service.getMyWorkspaces(req.user!.id);
      res.status(200).json({
        success: true,
        data: { workspaces },
      });
    } catch (error) {
      next(error);
    }
  };

  // GET /api/v1/workspace/:id
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspace = await this.service.getById(String(req.params['id']));
      res.status(200).json({
        success: true,
        data: { workspace },
      });
    } catch (error) {
      next(error);
    }
  };

  // PUT /api/v1/workspace/:id
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspace = await this.service.update(String(req.params['id']), req.user!.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Workspace updated successfully.',
        data: { workspace },
      });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /api/v1/workspace/:id
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(String(req.params['id']), req.user!.id);
      res.status(200).json({
        success: true,
        message: 'Workspace deleted successfully.',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  };

  // POST /api/v1/workspace/join
  join = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspace = await this.service.joinByRoomCode(req.body);
      res.status(200).json({
        success: true,
        message: 'Workspace found.',
        data: { workspace },
      });
    } catch (error) {
      next(error);
    }
  };
}
