/**
 * @devsync/shared-config/vitest/base
 *
 * Base Vitest configuration for Node.js ESM packages (gateway, ai-service).
 * Import and spread into your vitest.config.ts.
 *
 * Usage:
 *   import base from '@devsync/shared-config/vitest/base';
 *   import { defineConfig } from 'vitest/config';
 *   export default defineConfig({ test: { ...base } });
 */

/** @type {import('vitest').InlineConfig} */
module.exports = {
  environment: 'node',
  globals: true,
  include: ['src/**/*.{test,spec}.ts'],
  exclude: ['node_modules', 'dist'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    include: ['src/**/*.ts'],
    exclude: ['src/**/*.d.ts', 'src/**/index.ts'],
    thresholds: {
      lines: 70,
      branches: 60,
      functions: 70,
      statements: 70,
    },
  },
  clearMocks: true,
  restoreMocks: true,
};
