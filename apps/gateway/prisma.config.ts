import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// =============================================================================
// DevSync AI — Prisma Configuration (Prisma v7+)
// Connection URLs loaded from process.env via dotenv/config.
// DATABASE_URL uses PgBouncer for runtime queries.
// DIRECT_URL is used by Prisma Migrate and introspection.
// =============================================================================

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Direct URL for schema push/migration if available, fallback to DATABASE_URL
    url: process.env['DIRECT_URL'] || process.env['DATABASE_URL'] || '',
    directUrl: process.env['DIRECT_URL'],
  },
});
