import type { Request, Response } from 'express';
import type { FileService } from './file.service.js';
import { createFileSchema, updateFileSchema } from './filesystem.validator.js';

export class FileController {
  constructor(private readonly fileService: FileService) {}

  /** POST /files */
  createFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const dto = createFileSchema.parse(req.body);
      const file = await this.fileService.createFile(dto);
      res.status(201).json({ success: true, data: file });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create file';
      res.status(400).json({ success: false, error: message });
    }
  };

  /** GET /files OR /files/:workspaceId (List workspace files) */
  getFilesByWorkspace = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['workspaceId'] || req.query['workspaceId'];
      const workspaceId = Array.isArray(paramVal)
        ? (paramVal[0] as string)
        : (paramVal as string | undefined);

      if (!workspaceId || workspaceId.trim() === '') {
        res.status(200).json({ success: true, data: [] });
        return;
      }
      const files = await this.fileService.getFilesByWorkspace(workspaceId);
      res.status(200).json({ success: true, data: files });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch files';
      res.status(500).json({ success: false, error: message });
    }
  };

  /** GET /files/detail/:id (Get file by id) */
  getFileById = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['id'];
      const id = Array.isArray(paramVal) ? paramVal[0] : paramVal;
      if (!id) {
        res.status(400).json({ success: false, error: 'File ID required' });
        return;
      }
      const file = await this.fileService.getFileById(id);
      if (!file) {
        res.status(404).json({ success: false, error: 'File not found' });
        return;
      }
      res.status(200).json({ success: true, data: file });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch file';
      res.status(500).json({ success: false, error: message });
    }
  };

  /** PUT /files/:id */
  updateFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['id'];
      const id = Array.isArray(paramVal) ? paramVal[0] : paramVal;
      if (!id) {
        res.status(400).json({ success: false, error: 'File ID required' });
        return;
      }
      const dto = updateFileSchema.parse(req.body);
      const file = await this.fileService.updateFile(id, dto);
      res.status(200).json({ success: true, data: file });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update file';
      res.status(400).json({ success: false, error: message });
    }
  };

  /** DELETE /files/:id */
  deleteFile = async (req: Request, res: Response): Promise<void> => {
    try {
      const paramVal = req.params['id'];
      const id = Array.isArray(paramVal) ? paramVal[0] : paramVal;
      if (!id) {
        res.status(400).json({ success: false, error: 'File ID required' });
        return;
      }
      await this.fileService.deleteFile(id);
      res.status(200).json({ success: true, message: 'File deleted successfully' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete file';
      res.status(400).json({ success: false, error: message });
    }
  };
}
