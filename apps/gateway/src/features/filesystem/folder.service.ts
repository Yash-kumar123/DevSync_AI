import type { Folder } from '@prisma/client';
import type { IFolderRepository } from './folder.repository.js';
import type { CreateFolderDto, UpdateFolderDto } from './filesystem.types.js';
import { resolveWorkspaceId } from '../../utils/workspace-resolver.js';

export class FolderService {
  constructor(private readonly folderRepo: IFolderRepository) {}

  async createFolder(dto: CreateFolderDto): Promise<Folder> {
    const resolvedWorkspaceId = await resolveWorkspaceId(dto.workspaceId);
    return this.folderRepo.create({
      workspace: { connect: { id: resolvedWorkspaceId } },
      name: dto.name,
      ...(dto.parentId ? { parent: { connect: { id: dto.parentId } } } : {}),
    });
  }

  async getFoldersByWorkspace(workspaceId: string): Promise<Folder[]> {
    const resolvedWorkspaceId = await resolveWorkspaceId(workspaceId);
    return this.folderRepo.findByWorkspaceId(resolvedWorkspaceId);
  }

  async getFolderById(id: string): Promise<Folder | null> {
    return this.folderRepo.findById(id);
  }

  async updateFolder(id: string, dto: UpdateFolderDto): Promise<Folder> {
    const existing = await this.folderRepo.findById(id);
    if (!existing) {
      throw new Error('Folder not found');
    }

    return this.folderRepo.update(id, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.parentId !== undefined
        ? dto.parentId === null
          ? { parent: { disconnect: true } }
          : { parent: { connect: { id: dto.parentId } } }
        : {}),
    });
  }

  async deleteFolder(id: string): Promise<void> {
    const existing = await this.folderRepo.findById(id);
    if (!existing) {
      throw new Error('Folder not found');
    }
    await this.folderRepo.delete(id);
  }
}
