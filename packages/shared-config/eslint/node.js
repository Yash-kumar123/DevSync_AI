/**
 * @devsync/shared-config/eslint/node
 *
 * ESLint config for Node.js back-end packages (gateway, ai-service).
 * Extends base rules + Node.js globals.
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['@devsync/shared-config/eslint/base'],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // Back-end code may use process.exit and console deliberately
    'no-process-exit': 'off',
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
  },
};
