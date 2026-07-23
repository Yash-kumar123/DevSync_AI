import type { CorsOptions } from 'cors';
import { env } from './env.js';

export const corsOptions: CorsOptions = {
  origin: (requestOrigin, callback) => {
    // Allow requests with no origin (e.g. server-to-server, curl, mobile apps)
    if (!requestOrigin) {
      return callback(null, true);
    }

    const rawOrigins = process.env['CORS_ALLOWED_ORIGINS'] || env.corsOrigin;
    const configuredOrigins = rawOrigins
      .split(',')
      .map((o) => o.trim().replace(/\/$/, ''))
      .filter(Boolean);

    const normalizedRequestOrigin = requestOrigin.replace(/\/$/, '');

    // When credentials: true is enabled, Access-Control-Allow-Origin cannot be '*'
    // Reflect the requesting origin back if allowed
    if (
      configuredOrigins.includes('*') ||
      configuredOrigins.includes(normalizedRequestOrigin) ||
      /\.vercel\.app$/.test(normalizedRequestOrigin) ||
      normalizedRequestOrigin.includes('localhost')
    ) {
      return callback(null, requestOrigin);
    }

    return callback(null, requestOrigin);
  },
  credentials: true,
};
