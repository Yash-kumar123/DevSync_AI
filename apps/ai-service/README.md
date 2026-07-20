# DevSync AI — AI Service

The **ai-service** is an isolated micro-service responsible for all AI model interactions. Separating it from the gateway enables independent scaling, model-provider swapping, and tight security boundary for API keys.

## Overview

| Concern | Choice |
|---|---|
| Runtime | Node.js ≥ 20 (ESM) |
| Language | TypeScript (strict) |
| HTTP transport | TBD — Fastify or Hono |
| AI providers | OpenAI · Anthropic · Google AI |
| Testing | Vitest |
| Port (dev) | `5000` |

## Planned responsibilities

- Receive prompts from the gateway (no direct public exposure)
- Select & call the appropriate AI provider SDK
- Stream LLM completions back via Server-Sent Events (SSE) / chunked JSON
- Prompt template management & versioning
- Token-usage metering & logging

## Directory layout (target)

```
apps/ai-service/
├── src/
│   ├── providers/     # Provider adapter interfaces (OpenAI, Anthropic, …)
│   ├── prompts/       # Prompt templates & versioned chains
│   ├── routes/        # HTTP route handlers exposed to gateway
│   ├── lib/           # Shared utilities (streaming helpers, token counters)
│   └── index.ts       # Service entry-point
├── package.json
└── tsconfig.json
```

## Scripts

```bash
npm run dev          # Start with tsx --watch on :5000
npm run build        # tsc → dist/
npm run start        # node dist/index.js
npm run typecheck    # TypeScript typecheck
npm run test         # Vitest unit tests
```

## Security note

All AI provider API keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.) must be loaded from environment variables. See `.env.example` at the repository root for the full list.
