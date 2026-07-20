/**
 * @devsync/shared-config/prettier
 *
 * Canonical Prettier config for the entire monorepo.
 * Consumed by the root package.json "prettier" field and
 * by individual packages via `prettier --config node_modules/@devsync/shared-config/prettier/index.js`.
 */

/** @type {import('prettier').Config} */
module.exports = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  endOfLine: 'lf',
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: { trailingComma: 'none' },
    },
    {
      files: ['*.md', '*.mdx'],
      options: { proseWrap: 'always', printWidth: 80 },
    },
  ],
};
