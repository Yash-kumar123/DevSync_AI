import type { File, Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';

export interface IFileRepository {
  create(data: Prisma.FileCreateInput): Promise<File>;
  findById(id: string): Promise<File | null>;
  findByWorkspaceId(workspaceId: string): Promise<File[]>;
  update(id: string, data: Prisma.FileUpdateInput): Promise<File>;
  delete(id: string): Promise<void>;
}

export class FileRepository implements IFileRepository {
  async create(data: Prisma.FileCreateInput): Promise<File> {
    return prisma.file.create({ data });
  }

  async findById(id: string): Promise<File | null> {
    return prisma.file.findUnique({ where: { id } });
  }

  async findByWorkspaceId(workspaceId: string): Promise<File[]> {
    return prisma.file.findMany({
      where: { workspaceId },
      orderBy: { fileName: 'asc' },
    });
  }

  async update(id: string, data: Prisma.FileUpdateInput): Promise<File> {
    return prisma.file.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.file.delete({ where: { id } });
  }
}
