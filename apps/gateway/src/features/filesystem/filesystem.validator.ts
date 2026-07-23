import { z } from 'zod';

export const createFolderSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  parentId: z.string().nullable().optional(),
  name: z.string().min(1, 'Folder name is required').max(100, 'Name too long'),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(100, 'Name too long').optional(),
  parentId: z.string().nullable().optional(),
});

export const createFileSchema = z.object({
  workspaceId: z.string().min(1, 'Workspace ID is required'),
  folderId: z.string().nullable().optional(),
  fileName: z.string().min(1, 'File name is required').max(150, 'File name too long'),
  extension: z.string().optional(),
  content: z.string().optional(),
});

export const updateFileSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(150, 'File name too long').optional(),
  extension: z.string().optional(),
  content: z.string().optional(),
  folderId: z.string().nullable().optional(),
});
