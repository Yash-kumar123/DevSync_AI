# Contributing to DevSync AI

Thank you for considering a contribution! This guide covers everything you need to know.

## Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you agree to uphold this standard.

## Getting Started

1. Fork the repository and clone your fork.
2. Run `bash scripts/setup.sh` to bootstrap your local environment.
3. Create a feature branch: `git checkout -b feat/my-feature`

## Branch Naming Convention

| Type | Pattern | Example |
|---|---|---|
| Feature | `feat/<description>` | `feat/ai-completion` |
| Bug fix | `fix/<description>` | `fix/ws-reconnect` |
| Documentation | `docs/<description>` | `docs/api-reference` |
| Chore | `chore/<description>` | `chore/update-deps` |

## Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Every commit must follow:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

**Types:** `feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `build` · `ci` · `chore` · `revert`

**Examples:**
```
feat(gateway): add WebSocket room management
fix(web): correct cursor desync on reconnect
docs(arch): update data flow diagram
```

Commits that do not follow this format will be rejected by the `commit-msg` Git hook.

## Pull Request Guidelines

- All PRs must target `develop` (never `main` directly).
- PRs must pass all CI checks before merging.
- PR titles must follow Conventional Commits format (enforced by the `pr-checks` workflow).
- Add tests for all new behaviour.
- Update documentation if you change public APIs.
- Keep PRs focused — one concern per PR.

## Development Workflow

```bash
# Run all apps in watch mode
npm run dev

# Run tests for a specific package
npm run test --workspace=packages/shared-types

# Run Turborepo for a single app
npx turbo run build --filter=apps/web
```

## Release Process

Releases are managed via [Changesets](https://github.com/changesets/changesets).

1. `npm run changeset` — create a changeset describing your change.
2. Commit the changeset file with your PR.
3. When the PR merges to `main`, the Release CI workflow opens a "Version Packages" PR automatically.
4. Merging that PR triggers the publish workflow.
