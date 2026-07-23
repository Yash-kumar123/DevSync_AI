import type { File } from '@prisma/client';
import type { IFileRepository } from './file.repository.js';
import type { CreateFileDto, UpdateFileDto } from './filesystem.types.js';
import { resolveWorkspaceId } from '../../utils/workspace-resolver.js';

function extractExtension(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    return parts.pop() || 'txt';
  }
  return 'txt';
}

export class FileService {
  constructor(private readonly fileRepo: IFileRepository) {}

  async createFile(dto: CreateFileDto): Promise<File> {
    const resolvedWorkspaceId = await resolveWorkspaceId(dto.workspaceId);
    const ext = dto.extension ?? extractExtension(dto.fileName);

    return this.fileRepo.create({
      workspace: { connect: { id: resolvedWorkspaceId } },
      fileName: dto.fileName,
      extension: ext,
      content: dto.content ?? '',
      ...(dto.folderId ? { folder: { connect: { id: dto.folderId } } } : {}),
    });
  }

  async getFilesByWorkspace(workspaceId: string): Promise<File[]> {
    const resolvedWorkspaceId = await resolveWorkspaceId(workspaceId);
    return this.fileRepo.findByWorkspaceId(resolvedWorkspaceId);
  }

  async getFileById(id: string): Promise<File | null> {
    return this.fileRepo.findById(id);
  }

  async updateFile(id: string, dto: UpdateFileDto): Promise<File> {
    const existing = await this.fileRepo.findById(id);
    if (!existing) {
      throw new Error('File not found');
    }

    const newExt =
      dto.extension !== undefined
        ? dto.extension
        : dto.fileName !== undefined
          ? extractExtension(dto.fileName)
          : existing.extension;

    return this.fileRepo.update(id, {
      ...(dto.fileName !== undefined ? { fileName: dto.fileName } : {}),
      extension: newExt,
      ...(dto.content !== undefined ? { content: dto.content } : {}),
      ...(dto.folderId !== undefined
        ? dto.folderId === null
          ? { folder: { disconnect: true } }
          : { folder: { connect: { id: dto.folderId } } }
        : {}),
    });
  }

  async deleteFile(id: string): Promise<void> {
    const existing = await this.fileRepo.findById(id);
    if (!existing) {
      throw new Error('File not found');
    }
    await this.fileRepo.delete(id);
  }
}
