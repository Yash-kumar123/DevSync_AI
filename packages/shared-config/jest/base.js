/**
 * @devsync/shared-config/jest/base
 *
 * Base Jest configuration for TypeScript packages targeting Node.js.
 * Extend via `preset` or spread `...require('@devsync/shared-config/jest/base')`.
 */

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: false }],
  },
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/index.ts'],
  coverageThreshold: {
    global: { lines: 70, branches: 60, functions: 70, statements: 70 },
  },
  clearMocks: true,
  restoreMocks: true,
};
