# @devsync/shared-types

Canonical TypeScript types, interfaces, and [Zod](https://zod.dev) schemas shared across **all** DevSync AI apps and packages.

## Design principles

1. **Single source of truth** — every shared data shape lives here; apps never define their own copies.
2. **Runtime-safe** — Zod schemas double as both validators _and_ static type generators (`z.infer<typeof Schema>`).
3. **No business logic** — this package only holds type information and validation schemas, never executable business logic.

## Planned modules

| Module | Contents |
|---|---|
| `user` | `User`, `UserRole`, `UserSession` |
| `project` | `Project`, `ProjectMember`, `Permission` |
| `collaboration` | `CursorPosition`, `Operation`, `Presence` |
| `ai` | `CompletionRequest`, `CompletionResponse`, `StreamChunk` |
| `errors` | Discriminated-union error types |
| `events` | WebSocket event envelope types |

## Usage

```ts
import { SHARED_TYPES_VERSION } from '@devsync/shared-types';
```

After adding domain types:

```ts
import type { User } from '@devsync/shared-types';
import { UserSchema } from '@devsync/shared-types';

const parsed = UserSchema.parse(rawPayload);
```
