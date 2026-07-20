# =============================================================================
# docker/postgres/init/00_init.sql
# Runs automatically when the postgres container is created for the first time.
# =============================================================================

-- Ensure we are in the correct database
\c devsync_db;

-- Enable UUID extension (used for primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto (used for password hashing)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable citext (case-insensitive text, useful for emails)
CREATE EXTENSION IF NOT EXISTS citext;

-- -------------------------------------------------------------------------
-- Placeholder tables — real schema migrations will be managed by an ORM
-- (e.g., Drizzle ORM or Prisma) once application code is added.
-- -------------------------------------------------------------------------

-- This file intentionally kept minimal: only extensions and no data.
-- Add seed data scripts as 01_seed.sql, 02_seed.sql, etc.
