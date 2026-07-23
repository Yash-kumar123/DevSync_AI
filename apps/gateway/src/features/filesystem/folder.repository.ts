import type { Folder, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';

export interface IFolderRepository {
  create(data: Prisma.FolderCreateInput): Promise<Folder>;
  findById(id: string): Promise<Folder | null>;
  findByWorkspaceId(workspaceId: string): Promise<Folder[]>;
  update(id: string, data: Prisma.FolderUpdateInput): Promise<Folder>;
  delete(id: string): Promise<void>;
}

export class FolderRepository implements IFolderRepository {
  async create(data: Prisma.FolderCreateInput): Promise<Folder> {
    return prisma.folder.create({ data });
  }

  async findById(id: string): Promise<Folder | null> {
    return prisma.folder.findUnique({ where: { id } });
  }

  async findByWorkspaceId(workspaceId: string): Promise<Folder[]> {
    return prisma.folder.findMany({
      where: { workspaceId },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, data: Prisma.FolderUpdateInput): Promise<Folder> {
    return prisma.folder.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.folder.delete({ where: { id } });
  }
}
