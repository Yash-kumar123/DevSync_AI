import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

// =============================================================================
// DevSync AI — Prisma Singleton with Driver Adapter (Prisma v7+)
// Uses @prisma/adapter-pg with pg connection pool for direct PostgreSQL connection.
// Ensures a single PrismaClient instance per process.
// =============================================================================

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env['DIRECT_URL'] || process.env['DATABASE_URL'] || '';

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env['NODE_ENV'] === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });
}

/**
 * Singleton Prisma client.
 * Import this everywhere you need database access — never instantiate PrismaClient directly.
 */
export const prisma: PrismaClient = globalThis.__prisma ?? createPrismaClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalThis.__prisma = prisma;
}

/** Gracefully disconnect Prisma on process termination. */
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
