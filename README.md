<div align="center">

# 🚀 DevSync AI

**Open-source real-time collaborative AI IDE**

[![CI](https://github.com/your-org/devsync-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/devsync-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20-brightgreen)](https://nodejs.org)
[![Turborepo](https://img.shields.io/badge/built%20with-Turborepo-EF4444)](https://turbo.build)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Documentation](docs/) · [Architecture](docs/ARCHITECTURE.md) · [Contributing](docs/CONTRIBUTING.md) · [Roadmap](#roadmap)

</div>

---

## What is DevSync AI?

DevSync AI is a production-ready, open-source **collaborative code editor** built for modern engineering teams. It combines real-time multiplayer editing (think Google Docs for code) with context-aware AI assistance powered by leading language models.

> **Current state:** Monorepo scaffold — application code, APIs, and AI features are under active development.

---

## ✨ Planned Features

| Feature | Status |
|---|---|
| Real-time multi-cursor collaborative editing | 🔜 Planned |
| AI code completion & refactoring | 🔜 Planned |
| Syntax highlighting for 50+ languages | 🔜 Planned |
| Integrated terminal | 🔜 Planned |
| File tree & workspace management | 🔜 Planned |
| GitHub / GitLab integration | 🔜 Planned |
| Team presence & chat | 🔜 Planned |
| Plugin system | 🔜 Planned |

---

## 🏗️ Monorepo Structure

```
devsync-ai/
│
├── apps/
│   ├── web/              # Next.js 14 frontend (App Router)
│   ├── gateway/          # Node.js API gateway & WebSocket hub
│   └── ai-service/       # AI inference micro-service
│
├── packages/
│   ├── shared-types/     # TypeScript types & Zod schemas
│   ├── shared-config/    # ESLint, Prettier, Vitest presets
│   └── shared-ui/        # Headless React component library
│
├── docker/               # Dockerfiles & compose support files
├── docs/                 # Architecture docs, ADRs, guides
├── scripts/              # Developer tooling scripts
└── .github/workflows/    # CI/CD pipelines
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Monorepo** | [Turborepo](https://turbo.build) + npm workspaces |
| **Frontend** | [Next.js 14](https://nextjs.org) (App Router, RSC, TypeScript) |
| **Backend** | Node.js 20 ESM · Fastify _(planned)_ |
| **Real-time** | WebSocket · Redis pub/sub |
| **Database** | PostgreSQL 16 |
| **ORM** | Drizzle ORM _(planned)_ |
| **Cache** | Redis 7 |
| **Object Storage** | MinIO (S3-compatible) |
| **AI Providers** | OpenAI · Anthropic · Google AI |
| **Containers** | Docker · Docker Compose |
| **CI/CD** | GitHub Actions |
| **Language** | TypeScript 5 (strict) throughout |

---

## ⚡ Quick Start

### Prerequisites

| Tool | Minimum version |
|---|---|
| Node.js | 20.x |
| npm | 10.x |
| Docker | 24.x |
| Git | 2.40.x |

### 1. Clone the repository

```bash
git clone https://github.com/your-org/devsync-ai.git
cd devsync-ai
```

### 2. Automated setup (recommended)

```bash
bash scripts/setup.sh
```

This script will:
- Verify toolchain prerequisites
- Copy `.env.example` → `.env`
- Install all npm dependencies (`npm install`)
- Install Git hooks (Husky)
- Start Docker services (PostgreSQL, Redis, MinIO, Traefik)

### 3. Manual setup

```bash
# Copy environment variables
cp .env.example .env
# Edit .env and fill in your values

# Install dependencies
npm install

# Start infrastructure
npm run docker:up

# Start all apps in development mode
npm run dev
```

### 4. Access the apps

| Service | URL |
|---|---|
| Web (Next.js) | http://localhost:3000 |
| Gateway (API) | http://localhost:4000 |
| AI Service | http://localhost:5000 |
| MinIO Console | http://localhost:9001 |
| Traefik Dashboard | http://localhost:8080 |

---

## 📜 Available Scripts

All scripts are run from the **repository root** and delegate to Turborepo.

| Command | Description |
|---|---|
| `npm run dev` | Start all apps in watch mode |
| `npm run build` | Build all apps and packages |
| `npm run lint` | Lint all packages |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Verify formatting without writing |
| `npm run typecheck` | TypeScript type-check all packages |
| `npm run test` | Run all test suites |
| `npm run test:coverage` | Run tests and generate coverage |
| `npm run clean` | Remove all build artefacts |
| `npm run docker:up` | Start Docker services |
| `npm run docker:down` | Stop Docker services |
| `npm run docker:logs` | Stream Docker service logs |

---

## 🧩 Workspace Dependency Graph

```
apps/web          ──depends on──▶  packages/shared-types
                  ──depends on──▶  packages/shared-config
                  ──depends on──▶  packages/shared-ui

apps/gateway      ──depends on──▶  packages/shared-types
                  ──depends on──▶  packages/shared-config

apps/ai-service   ──depends on──▶  packages/shared-types
                  ──depends on──▶  packages/shared-config

packages/shared-ui ─depends on──▶  packages/shared-types
```

---

## 🔄 CI/CD Pipeline

```
push / PR
   │
   ├──▶ Setup (npm ci + cache)
   │
   ├──▶ Typecheck ─┐
   ├──▶ Lint       ├──▶  Build ──▶  Docker images ──▶  Staging ──▶  Production
   ├──▶ Format     │                                         (manual gate)
   └──▶ Test   ────┘
```

---

## 📚 Documentation

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | System design, data flows, tech decisions |
| [ADR-0001](docs/adr/0001-monorepo-turborepo.md) | Why Turborepo was chosen |
| [docker/README](docker/README.md) | Local Docker setup & port map |

---

## 🗺️ Roadmap

- [ ] Application scaffolding (Next.js pages, Fastify routes)
- [ ] Authentication (JWT + sessions)
- [ ] Database schema & ORM setup
- [ ] Real-time WebSocket collaboration engine
- [ ] AI completion API (streaming)
- [ ] Monaco Editor integration
- [ ] Plugin system
- [ ] Kubernetes Helm charts

---

## 🤝 Contributing

Contributions are warmly welcomed! Please read the [Contributing Guide](docs/CONTRIBUTING.md) before opening a PR.

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification and requires all PRs to pass the full CI pipeline.

---

## 📄 License

[MIT](LICENSE) © DevSync AI Contributors
