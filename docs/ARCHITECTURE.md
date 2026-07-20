# Architecture — DevSync AI

> **Status:** Living document — updated as architectural decisions are made.

## 1. System Overview

DevSync AI is a **real-time collaborative AI IDE** delivered as a web application. The system is decomposed into three independently deployable services hosted in a single Turborepo monorepo.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser / Client                          │
│              Next.js 14 (SSR + App Router)                       │
│                    apps/web  (:3000)                              │
└────────────────────────┬────────────────────────────────────────┘
                         │  HTTP REST  /  WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway                                │
│            Node.js · Fastify (planned)                           │
│                  apps/gateway  (:4000)                            │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐   │
│  │  Auth MW    │  │  WS Hub      │  │  REST Routes          │   │
│  └─────────────┘  └──────────────┘  └───────────────────────┘   │
└──────────┬─────────────────────────────────────┬────────────────┘
           │  Internal HTTP                       │  DB / Cache
           ▼                                      ▼
┌──────────────────────┐              ┌───────────────────────────┐
│    AI Service         │              │  PostgreSQL  (primary DB)  │
│  Node.js · Fastify    │              │  Redis       (cache/pubsub)│
│  apps/ai-service      │              │  MinIO       (object store)│
│    (:5000)            │              └───────────────────────────┘
└──────────────────────┘
```

## 2. Monorepo Structure

| Layer | Location | Purpose |
|---|---|---|
| **Apps** | `apps/` | Deployable services (web, gateway, ai-service) |
| **Shared Types** | `packages/shared-types` | Single source-of-truth for all data contracts |
| **Shared Config** | `packages/shared-config` | ESLint · Prettier · Jest · Vitest presets |
| **Shared UI** | `packages/shared-ui` | Headless React component library |

## 3. Key Architectural Decisions

See `docs/adr/` for the full rationale behind each decision.

| Decision | Choice | ADR |
|---|---|---|
| Monorepo manager | Turborepo | ADR-0001 |
| Package manager | npm workspaces | ADR-0001 |
| Frontend framework | Next.js 14 (App Router) | — |
| Backend framework | Fastify (Node.js) | TBD |
| Real-time transport | WebSocket (Socket.IO or native) | TBD |
| Database | PostgreSQL 16 | TBD |
| ORM | Drizzle ORM (planned) | TBD |
| Cache / Pub-Sub | Redis 7 | TBD |
| Object storage | MinIO (S3-compatible) | TBD |
| Container orchestration | Docker Compose (dev) / Kubernetes (prod) | TBD |

## 4. Data Flow — AI Completion Request

```
User types in editor
       │
       ▼
  web (Next.js)
  sends REST POST /api/completions
       │
       ▼
  gateway validates request, checks auth & rate-limit
       │
       ▼
  gateway proxies to ai-service (internal network only)
       │
       ▼
  ai-service selects provider, streams SSE response
       │
       ▼
  gateway streams chunks back to client
       │
       ▼
  web renders streaming completion tokens in editor
```

## 5. Real-Time Collaboration Flow

```
User A edits a file
       │
       ▼
  Operational Transform / CRDT applied locally
       │  WebSocket frame
       ▼
  gateway WS hub receives operation
       │  pub/sub (Redis)
       ▼
  all peers in the same room receive the operation
       │
       ▼
  peers apply the operation to their local state
```
