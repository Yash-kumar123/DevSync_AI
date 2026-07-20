# ADR-0001: Turborepo as Monorepo Manager

| Field | Value |
|---|---|
| **Status** | accepted |
| **Date** | 2026-07-20 |
| **Deciders** | DevSync AI core team |

## Context

DevSync AI consists of three independently deployable applications (`web`, `gateway`, `ai-service`) and three shared packages (`shared-types`, `shared-config`, `shared-ui`). Managing dependencies, build order, and caching across these six workspaces manually becomes error-prone at scale.

## Decision

We will use **Turborepo** (v2) as the build system / task runner on top of **npm workspaces** as the package manager.

## Rationale

| Criteria | Turborepo | Nx | Lerna |
|---|---|---|---|
| Incremental builds (content-hash cache) | ✅ native | ✅ native | ❌ |
| Remote cache (Vercel / self-hosted) | ✅ | ✅ | ❌ |
| Config complexity | low | high | medium |
| Community momentum (2024) | growing | large | declining |
| Next.js ecosystem fit | first-class | good | poor |

Turborepo's zero-config approach, deep Vercel ecosystem integration, and straightforward `turbo.json` pipeline make it the best fit for this project's current team size and technology stack.

## Consequences

- All tasks (`build`, `test`, `lint`, etc.) are defined as a DAG in `turbo.json`.
- Each workspace package defines its tasks in its own `package.json`; Turborepo orchestrates them.
- Turborepo remote cache can be enabled later by setting `TURBO_TOKEN` and `TURBO_TEAM` environment variables (zero code changes required).
- If the project outgrows Turborepo (e.g., requires language-level polyglot support), migration to Nx is feasible because both use a similar `package.json` scripts-based model.
