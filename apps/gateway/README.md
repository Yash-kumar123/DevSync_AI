# DevSync AI — API Gateway

The **gateway** package is the backend entry-point for all client traffic. It handles HTTP REST routes, WebSocket connections, and acts as a reverse proxy to internal micro-services.

## Overview

| Concern | Choice |
|---|---|
| Runtime | Node.js ≥ 20 (ESM) |
| Language | TypeScript (strict) |
| HTTP / WS framework | TBD — Fastify or Hono |
| Real-time transport | TBD — Socket.IO or native WS |
| Testing | Vitest |
| Port (dev) | `4000` |

## Planned responsibilities

- REST API routing & request validation (Zod)
- WebSocket session management (collaborative editing hub)
- Authentication middleware (JWT verification)
- Rate-limiting & request coalescing
- Proxying AI completion requests to `ai-service`

## Directory layout (target)

```
apps/gateway/
├── src/
│   ├── routes/        # HTTP route handlers
│   ├── ws/            # WebSocket handlers & rooms
│   ├── middleware/    # Auth, rate-limit, logger
│   ├── plugins/       # Fastify/Hono plugins
│   ├── lib/           # Internal helpers (redis client, db client)
│   └── index.ts       # Service entry-point
├── package.json
└── tsconfig.json
```

## Scripts

```bash
npm run dev          # Start with tsx --watch on :4000
npm run build        # tsc → dist/
npm run start        # node dist/index.js
npm run typecheck    # TypeScript typecheck
npm run test         # Vitest unit tests
```
