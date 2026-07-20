# docs/

This directory is the **single home for all project documentation**.

## Structure

```
docs/
├── ARCHITECTURE.md        # High-level system design & decisions
├── CONTRIBUTING.md        # How to contribute (branching, PRs, releases)
├── DEVELOPMENT.md         # Local environment setup & common tasks
├── API.md                 # API contract reference (REST + WebSocket)
├── DEPLOYMENT.md          # Infrastructure & deployment runbook
├── SECURITY.md            # Security policy & vulnerability reporting
└── adr/                   # Architecture Decision Records
    └── 0001-monorepo-turborepo.md
```

## ADR convention

Architecture Decision Records (ADRs) live in `docs/adr/`. Each file is numbered and immutable once merged. To supersede a decision, create a new ADR that references the old one.

| Status values | Meaning |
|---|---|
| `proposed` | Under discussion |
| `accepted` | Implemented or will be implemented |
| `deprecated` | No longer relevant |
| `superseded by ADR-XXXX` | Replaced by a newer decision |
