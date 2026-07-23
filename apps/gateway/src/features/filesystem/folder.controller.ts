import type { Request, Response } from 'express';
import type { FolderService } from './folder.service.js';
import { createFolderSchema, updateFolderSchema } from './filesystem.validator.js';

export class FolderController {
  constructor(private readonly folderService: FolderService) {}

  /** POST /folders */
  createFolder = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = createFolderSchema.parse(req.body);
      const folder = await this.folderService.createFolder(dto);
      res.status(201).json({ success: true, data: folder });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create folder';
      res.status(400).json({ success: false, error: message });
    }
  };

  /** GET /folders OR /folders/:workspaceId */
  getFoldersByWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['workspaceId'] || req.query['workspaceId'];
      const workspaceId = Array.isArray(paramVal)
        ? (paramVal[0] as string)
        : (paramVal as string | undefined);

      if (!workspaceId || workspaceId.trim() === '') {
        res.status(200).json({ success: true, data: [] });
        return;
      }
      const folders = await this.folderService.getFoldersByWorkspace(workspaceId);
      res.status(200).json({ success: true, data: folders });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch folders';
      res.status(500).json({ success: false, error: message });
    }
  };

  /** PUT /folders/:id */
  updateFolder = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['id'];
      const id = Array.isArray(paramVal) ? paramVal[0] : paramVal;
      if (!id) {
        res.status(400).json({ success: false, error: 'Folder ID required' });
        return;
      }
      const dto = updateFolderSchema.parse(req.body);
      const folder = await this.folderService.updateFolder(id, dto);
      res.status(200).json({ success: true, data: folder });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update folder';
      res.status(400).json({ success: false, error: message });
    }
  };

  /** DELETE /folders/:id */
  deleteFolder = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['id'];
      const id = Array.isArray(paramVal) ? paramVal[0] : paramVal;
      if (!id) {
        res.status(400).json({ success: false, error: 'Folder ID required' });
        return;
      }
      await this.folderService.deleteFolder(id);
      res.status(200).json({ success: true, message: 'Folder deleted successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete folder';
      res.status(400).json({ success: false, error: message });
    }
  };
}
