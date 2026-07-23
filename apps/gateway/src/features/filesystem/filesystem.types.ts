// =============================================================================
// DevSync AI — File System Types & DTOs
// =============================================================================

export interface CreateFolderDto {
  workspaceId: string;
  parentId?: string | null | undefined;
  name: string;
}

export interface UpdateFolderDto {
  name?: string | undefined;
  parentId?: string | null | undefined;
}

export interface CreateFileDto {
  workspaceId: string;
  folderId?: string | null | undefined;
  fileName: string;
  extension?: string | undefined;
  content?: string | undefined;
}

export interface UpdateFileDto {
  fileName?: string | undefined;
  extension?: string | undefined;
  content?: string | undefined;
  folderId?: string | null | undefined;
}

export interface FolderResponse {
  id: string;
  workspaceId: string;
  parentId: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileResponse {
  id: string;
  workspaceId: string;
  folderId: string | null;
  fileName: string;
  extension: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
