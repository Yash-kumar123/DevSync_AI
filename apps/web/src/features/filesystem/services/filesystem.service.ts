import { http } from '@services/http';
import type { DBFolder, DBFile } from '../types/filesystem.types';

export const filesystemService = {
  // Folder APIs
  async createFolder(
    workspaceId: string,
    name: string,
    parentId?: string | null,
  ): Promise<DBFolder> {
    const res = await http.post<{ success: boolean; data: DBFolder }>('/v1/folders', {
      workspaceId,
      name,
      parentId: parentId ?? null,
    });
    return res.data.data;
  },

  async getFolders(workspaceId: string): Promise<DBFolder[]> {
    const res = await http.get<{ success: boolean; data: DBFolder[] }>(
      `/v1/folders/${workspaceId}`,
    );
    return res.data.data;
  },

  async updateFolder(id: string, name: string, parentId?: string | null): Promise<DBFolder> {
    const res = await http.put<{ success: boolean; data: DBFolder }>(`/v1/folders/${id}`, {
      name,
      ...(parentId !== undefined ? { parentId } : {}),
    });
    return res.data.data;
  },

  async deleteFolder(id: string): Promise<void> {
    await http.delete(`/v1/folders/${id}`);
  },

  // File APIs
  async createFile(
    workspaceId: string,
    fileName: string,
    folderId?: string | null,
    content?: string,
  ): Promise<DBFile> {
    const res = await http.post<{ success: boolean; data: DBFile }>('/v1/files', {
      workspaceId,
      fileName,
      folderId: folderId ?? null,
      content: content ?? '',
    });
    return res.data.data;
  },

  async getFiles(workspaceId: string): Promise<DBFile[]> {
    const res = await http.get<{ success: boolean; data: DBFile[] }>(`/v1/files/${workspaceId}`);
    return res.data.data;
  },

  async getFileById(id: string): Promise<DBFile> {
    const res = await http.get<{ success: boolean; data: DBFile }>(`/v1/files/detail/${id}`);
    return res.data.data;
  },

  async updateFile(
    id: string,
    updates: { fileName?: string; content?: string; folderId?: string | null },
  ): Promise<DBFile> {
    const res = await http.put<{ success: boolean; data: DBFile }>(`/v1/files/${id}`, updates);
    return res.data.data;
  },

  async deleteFile(id: string): Promise<void> {
    await http.delete(`/v1/files/${id}`);
  },
};
