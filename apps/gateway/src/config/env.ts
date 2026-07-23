import 'dotenv/config';

// =============================================================================
// DevSync AI — Gateway Environment Configuration
// Validates and exports all environment variables at startup.
// Fails fast if any required variable is missing or invalid.
// =============================================================================

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${key}`);
  }
  return value;
}

function getPort(value: string | undefined): number {
  const port = Number(value ?? 4000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('[env] PORT must be a valid TCP port number (1-65535)');
  }
  return port;
}

export const env = {
  nodeEnv: (process.env['NODE_ENV'] ?? 'development') as 'development' | 'production' | 'test',
  port: getPort(process.env['PORT']),
  corsOrigin: process.env['CORS_ALLOWED_ORIGINS'] ?? 'http://localhost:3000',

  // JWT — validated at startup so the server never starts with missing secrets
  jwtAccessSecret: requireEnv('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: requireEnv('JWT_REFRESH_SECRET'),
  jwtAccessExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] ?? '15m',
  jwtRefreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
} as const;

export type Env = typeof env;
