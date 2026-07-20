# @devsync/shared-config

Canonical **ESLint**, **Prettier**, **Jest**, and **Vitest** configuration presets for the DevSync AI monorepo.

Every app and package consumes these presets so that all code quality tooling is configured once and enforced consistently.

## Available sub-path exports

| Import path | Contents |
|---|---|
| `@devsync/shared-config/eslint/base` | TypeScript + import-order rules |
| `@devsync/shared-config/eslint/next` | Extends base + React + Next.js |
| `@devsync/shared-config/eslint/node` | Extends base + Node.js globals |
| `@devsync/shared-config/prettier` | Canonical Prettier ruleset |
| `@devsync/shared-config/jest/base` | ts-jest config for CJS packages |
| `@devsync/shared-config/vitest/base` | Vitest config for ESM packages |

## Usage

### ESLint (in a Node.js package)

```js
// .eslintrc.js
module.exports = {
  extends: ['@devsync/shared-config/eslint/node'],
  parserOptions: { project: './tsconfig.json' },
};
```

### Prettier (in package.json)

```json
{
  "prettier": "@devsync/shared-config/prettier"
}
```

### Vitest (in a gateway/ai-service package)

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import base from '@devsync/shared-config/vitest/base';

export default defineConfig({ test: base });
```
