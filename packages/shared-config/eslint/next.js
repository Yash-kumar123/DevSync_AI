/**
 * @devsync/shared-config/eslint/next
 *
 * ESLint config for Next.js (apps/web).
 * Extends base rules + React + Next.js specific rules.
 */

/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '@devsync/shared-config/eslint/base',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'next/core-web-vitals',
  ],
  plugins: ['react', 'react-hooks'],
  settings: {
    react: { version: 'detect' },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',   // Not needed in Next.js 13+
    'react/prop-types': 'off',           // TypeScript handles this
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
};
