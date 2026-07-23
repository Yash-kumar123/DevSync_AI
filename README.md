# ⚡ DevSync AI — Real-Time Collaborative AI-Powered Cloud IDE

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.10+-009688.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](https://www.docker.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444.svg)](https://turbo.build/repo)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

**DevSync AI** is an open-source, next-generation, cloud-native collaborative Code Editor and IDE. Built as a high-performance monorepo, it seamlessly blends real-time multiplayer code editing (Yjs + WebSockets) with intelligent multi-agent AI pair-programming, RAG codebase indexing, integrated web terminals, visual Git studio, and comprehensive workspace administration.

---

## 📑 Table of Contents

- [✨ Features Overview](#-features-overview)
  - [👥 Real-Time Multiplayer Collaboration](#-real-time-multiplayer-collaboration)
  - [🤖 Autonomous Multi-Agent AI & Pair Programmer](#-autonomous-multi-agent-ai--pair-programmer)
  - [📚 RAG & Codebase Intelligence](#-rag--codebase-intelligence)
  - [💻 Embedded Web Terminal & Sandbox Service](#-embedded-web-terminal--sandbox-service)
  - [🌿 Built-in Source Control (Git Integration)](#-built-in-source-control-git-integration)
  - [🛡️ Admin Dashboard & Workspace Analytics](#️-admin-dashboard--workspace-analytics)
- [🛠️ Architecture & Monorepo Structure](#️-architecture--monorepo-structure)
  - [System Architecture Diagram](#system-architecture-diagram)
  - [Monorepo Package Layout](#monorepo-package-layout)
- [💻 Tech Stack Reference](#-tech-stack-reference)
- [📂 Repository Directory Tree](#-repository-directory-tree)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start (Local Development)](#quick-start-local-development)
  - [Database Migrations & Prisma Setup](#database-migrations--prisma-setup)
- [🔑 Environment Variables Reference](#-environment-variables-reference)
- [🌐 Service Ports & Access Points](#-service-ports--access-points)
- [🐳 Docker Setup & Stack Management](#-docker-setup--stack-management)
- [🧪 Available Scripts & Commands](#-available-scripts--commands)
- [🗄️ Database Management & Prisma Studio](#️-database-management--prisma-studio)
- [🤝 Contributing & Git Guidelines](#-contributing--git-guidelines)
- [🛡️ Security](#️-security)
- [📄 License & Acknowledgments](#-license--acknowledgments)

---

## ✨ Features Overview

### 👥 Real-Time Multiplayer Collaboration

- **Yjs Shared Documents**: Concurrent multi-user code editing with conflict-free operation resolution using Yjs Conflict-Free Replicated Data Types (CRDTs).
- **Presence & Remote Cursors**: Live visualization of active collaborators, their current cursor positions, active line selections, and user avatars in real time.
- **Activity & Workspace Timeline**: Continuous audit log tracking member joins, line edits, file creations, and structural workspace modifications.

### 🤖 Autonomous Multi-Agent AI & Pair Programmer

- **Multi-Agent Orchestration**: Specialized AI agents (Planner, Coder, Auditor/Critic) collaborate in parallel to break down complex prompts, review code logic, and generate reliable solutions.
- **Multi-LLM Provider Support**: Native integration with OpenAI (GPT-4o), Anthropic (Claude 3.5), Google Gemini, Groq (Llama 3.3 70B), and local offline execution via Ollama.
- **One-Click & Auto Diff Application**: Review AI-suggested code modifications with inline side-by-side diff previews and apply them directly into editor buffers.
- **Interactive Streaming AI Chat**: Server-Sent Events (SSE) streaming responses with full Markdown rendering, code highlighting, and contextual file insertion.

### 📚 RAG & Codebase Intelligence

- **Semantic Code Search**: Deep context retrieval across large codebases using vector embeddings stored in ChromaDB.
- **Document & Repository Ingestion**: Index workspace source files, documentation, and PDFs to deliver grounded AI responses backed by precise line and source citations.

### 💻 Embedded Web Terminal & Sandbox Service

- **Interactive Shell (XTerm.js)**: Full-featured browser terminal connected to backend container environments over WebSockets.
- **Docker Container Management**: Live container health monitoring, start/stop container controls, and isolated environment execution directly from the web interface.

### 🌿 Built-in Source Control (Git Integration)

- **Visual Git Panel**: Inspect staged/unstaged changes, view side-by-side git diffs, manage branches, and discard uncommitted edits.
- **AI Commit Message Generator**: Automatically generate Conventional Commit messages based on active git diffs.
- **Git History Timeline**: Browse repository commit logs and author details without leaving the editor.

### 🛡️ Admin Dashboard & Workspace Analytics

- **System Health Monitoring**: Real-time telemetry monitoring throughput, memory consumption, latency, and status for API Gateway, AI Service, PostgreSQL, and Redis.
- **Governance & Permissions**: Role-based access control (RBAC), workspace member management, API token provisioning, and security audit logs.

---

## 🛠️ Architecture & Monorepo Structure

### System Architecture Diagram

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Browser Client (Web App)                            │
│                 React 19 · Vite / Next.js · Tailwind CSS                     │
│                           apps/web (:3000)                                  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │  HTTP REST / WebSocket (Yjs / XTerm)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             API & WS Gateway                                │
│                   Node.js · Express / Fastify · Prisma                      │
│                         apps/gateway (:4000)                                │
│  ┌────────────────────┐  ┌────────────────────┐  ┌──────────────────────┐  │
│  │ Auth & Permissions │  │  WebSocket Hub     │  │ Docker & Terminal    │  │
│  └────────────────────┘  └────────────────────┘  └──────────────────────┘  │
└───────────┬──────────────────────────┬──────────────────────────┬───────────┘
            │ Internal HTTP            │ DB Queries               │ Cache / PubSub
            ▼                          ▼                          ▼
┌────────────────────────┐  ┌────────────────────┐  ┌────────────────────────┐
│       AI Service       │  │  PostgreSQL 16     │  │        Redis 7         │
│  Python 3.10+ · FastAPI│  │  (Primary Store)   │  │  (Session & WS PubSub) │
│   apps/ai-service      │  └────────────────────┘  └────────────────────────┘
│       (:5000)          │  ┌────────────────────┐  ┌────────────────────────┐
│  ┌──────────────────┐  │  │      ChromaDB      │  │        MinIO S3        │
│  │ Agents & LangChain│  │  │  (Vector Embeddings│  │   (Object Storage)     │
│  └──────────────────┘  │  └────────────────────┘  └────────────────────────┘
└────────────────────────┘
```

### Monorepo Package Layout

| Package / App            | Location                 | Technology Stack                           | Description                                                                      |
| :----------------------- | :----------------------- | :----------------------------------------- | :------------------------------------------------------------------------------- |
| `@devsync/web`           | `apps/web`               | React 19, Vite, Tailwind, Zustand          | Frontend single-page application and IDE workbench UI.                           |
| `@devsync/gateway`       | `apps/gateway`           | Node.js, Express, Socket.io, Prisma        | API Gateway, authentication, real-time Yjs CRDT hub, terminal WebSocket bridge.  |
| `@devsync/ai-service`    | `apps/ai-service`        | Python 3.10+, FastAPI, LangChain, ChromaDB | Multi-agent execution engine, RAG pipeline, LLM provider router.                 |
| `@devsync/shared-types`  | `packages/shared-types`  | TypeScript                                 | Shared data interfaces, API contracts, DTOs, and WebSocket protocol definitions. |
| `@devsync/shared-config` | `packages/shared-config` | ESLint, Prettier, TypeScript               | Standardized monorepo tool configurations.                                       |
| `@devsync/shared-ui`     | `packages/shared-ui`     | React, Tailwind CSS                        | Shared reusable UI component primitives.                                         |

---

## 💻 Tech Stack Reference

| Layer                         | Primary Technologies                                                                |
| :---------------------------- | :---------------------------------------------------------------------------------- |
| **Frontend UI**               | React 19, Vite, TypeScript 5.5, Tailwind CSS, Zustand, XTerm.js, Lucide Icons       |
| **Real-time Collaboration**   | Yjs, Y-Websocket, Socket.io, CRDT Document Models                                   |
| **API Gateway & Server**      | Node.js (>=20), Express / Fastify, Prisma ORM, Socket.io, Winston                   |
| **AI & RAG Engine**           | Python 3.10+, FastAPI, Uvicorn, LangChain, ChromaDB, SentenceTransformers, Pydantic |
| **Database & Caching**        | PostgreSQL 16, Redis 7 (Pub/Sub & Caching), MinIO S3-compatible Object Storage      |
| **DevOps & Containerization** | Docker, Docker Compose, Turborepo (build system), npm Workspaces                    |
| **Code Quality & CI**         | ESLint 9, Prettier, TypeScript `tsc`, Husky, Lint-Staged, Commitlint, Changesets    |

---

## 📂 Repository Directory Tree

```text
DevSync_AI/
├── .agents/                 # Workspace Agent Configurations & Custom Skills
├── .github/                 # GitHub Actions Workflows & Issue Templates
│   └── workflows/           # CI/CD Pipeline Automation
├── .husky/                  # Git Hook Handlers (commit-msg, pre-commit)
├── apps/
│   ├── ai-service/          # FastAPI Python AI Service
│   │   ├── app/             # Agents, Embeddings, Providers, Routers, Vectorstore
│   │   ├── Dockerfile       # Container definition for AI Service
│   │   └── pyproject.toml   # Python dependencies & metadata
│   ├── gateway/             # Node.js API Gateway & WebSocket Hub
│   │   ├── prisma/          # Database Schema & Migration files
│   │   ├── src/             # Controllers, Services, Socket handlers, Routes
│   │   └── Dockerfile       # Container definition for Gateway
│   └── web/                 # React 19 + Vite Frontend App
│       ├── src/             # Components, Features, Hooks, Pages, Store
│       └── Dockerfile       # Container definition for Web Frontend
├── docker/                  # Persistent Docker volumes and configs
├── docs/                    # Architecture Docs, ADRs, Security & Contributing Guides
│   ├── adr/                 # Architecture Decision Records
│   ├── ARCHITECTURE.md      # Detailed Architectural Overview
│   ├── CONTRIBUTING.md      # Contribution & Git Workflow Guide
│   └── SECURITY.md          # Security Policy & Vulnerability Reporting
├── packages/
│   ├── shared-config/       # Centralized ESLint, Prettier, TS Configs
│   ├── shared-types/        # Workspace-wide TypeScript contracts
│   └── shared-ui/           # Common React component library
├── scripts/                 # Utility scripts (setup.sh, clean.sh, check-versions.sh)
├── .env.example             # Global Environment Template
├── commitlint.config.js     # Conventional Commits Rules
├── docker-compose.yml       # Docker Stack Orchestration File
├── package.json             # Root Workspace Configuration & Scripts
├── tsconfig.base.json       # Base TypeScript Configuration
└── turbo.json               # Turborepo Build Pipeline Task Definitions
```

---

## 🚀 Getting Started

### Prerequisites

Ensure the following tools are installed on your machine:

- **Node.js**: `>= 20.0.0` ([Download Node.js](https://nodejs.org/))
- **npm**: `>= 10.0.0`
- **Python**: `>= 3.10` ([Download Python](https://www.python.org/))
- **Docker & Docker Desktop**: Required for PostgreSQL, Redis, MinIO, and container management ([Download Docker](https://www.docker.com/))
- **Git**: `>= 2.30.0`

---

### Quick Start (Local Development)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Yash-kumar123/DevSync_AI.git
   cd DevSync_AI
   ```

2. **Run Environment Bootstrap Script** _(Optional Linux/macOS/Git Bash)_:

   ```bash
   bash scripts/setup.sh
   ```

3. **Install Monorepo Node Dependencies**:

   ```bash
   npm install
   ```

4. **Set Up Python Environment for AI Service**:

   ```bash
   cd apps/ai-service
   python -m venv .venv

   # On Windows (PowerShell)
   .venv\Scripts\Activate.ps1
   # On macOS / Linux
   # source .venv/bin/activate

   python -m pip install --upgrade pip
   python -m pip install -e ".[dev]"
   cd ../..
   ```

5. **Configure Environment Variables**:

   Copy example `.env` files across the workspace:

   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env
   Copy-Item apps/gateway/.env.example apps/gateway/.env
   Copy-Item apps/ai-service/.env.example apps/ai-service/.env
   Copy-Item apps/web/.env.example apps/web/.env

   # Linux / macOS
   # cp .env.example .env
   # cp apps/gateway/.env.example apps/gateway/.env
   # cp apps/ai-service/.env.example apps/ai-service/.env
   # cp apps/web/.env.example apps/web/.env
   ```

6. **Start PostgreSQL & Redis Infrastructure via Docker**:

   ```bash
   docker compose up -d redis
   ```

7. **Run Database Migrations**:

   ```bash
   npm run gateway:migrate --workspace=apps/gateway
   # Or run directly via Prisma:
   # cd apps/gateway && npx prisma migrate dev
   ```

8. **Launch All Services in Development Mode**:

   ```bash
   npm run dev
   ```

   Turborepo will start `apps/web`, `apps/gateway`, and `apps/ai-service` in parallel with hot reloading enabled!

---

## 🔑 Environment Variables Reference

Below is a summary of primary configuration flags available in `.env.example`:

| Environment Variable           | Service      | Default Value                                                   | Description                                                    |
| :----------------------------- | :----------- | :-------------------------------------------------------------- | :------------------------------------------------------------- |
| `NODE_ENV`                     | Global       | `development`                                                   | Runtime environment mode (`development`, `production`, `test`) |
| `DATABASE_URL`                 | Gateway      | `postgresql://devsync:devsync_secret@localhost:5432/devsync_db` | PostgreSQL connection string                                   |
| `REDIS_URL`                    | Gateway / AI | `redis://:redis_secret@localhost:6379`                          | Redis connection URL for caching and Pub/Sub                   |
| `GATEWAY_PORT`                 | Gateway      | `4000`                                                          | Port for Express/Socket.io API Gateway                         |
| `AI_SERVICE_PORT`              | AI Service   | `5000`                                                          | Port for FastAPI Python AI Service                             |
| `OPENAI_API_KEY`               | AI Service   | `sk-...`                                                        | OpenAI API key for GPT models                                  |
| `ANTHROPIC_API_KEY`            | AI Service   | `sk-ant-...`                                                    | Anthropic API key for Claude models                            |
| `GOOGLE_AI_API_KEY`            | AI Service   | `...`                                                           | Google AI API key for Gemini models                            |
| `GROQ_API_KEY`                 | AI Service   | `gsk_...`                                                       | Groq API key for high-speed Llama inference                    |
| `OLLAMA_BASE_URL`              | AI Service   | `http://localhost:11434`                                        | Ollama local model provider endpoint                           |
| `NEXT_PUBLIC_GATEWAY_WS_URL`   | Web          | `ws://localhost:4000`                                           | WebSocket endpoint for real-time sync & terminals              |
| `NEXT_PUBLIC_GATEWAY_HTTP_URL` | Web          | `http://localhost:4000`                                         | HTTP API base URL for gateway requests                         |

---

## 🌐 Service Ports & Access Points

| Service / Interface     | Tech Stack          | URL / Access Endpoint              | Swagger / Docs                   |
| :---------------------- | :------------------ | :--------------------------------- | :------------------------------- |
| **Web Frontend**        | React 19 + Vite     | `http://localhost:3000`            | —                                |
| **API Gateway**         | Express + Socket.io | `http://localhost:4000`            | `http://localhost:4000/api/docs` |
| **Gateway Health**      | REST Endpoint       | `http://localhost:4000/api/health` | —                                |
| **AI Service**          | FastAPI + Uvicorn   | `http://localhost:5000`            | `http://localhost:5000/docs`     |
| **AI Service Health**   | REST Endpoint       | `http://localhost:5000/api/health` | —                                |
| **PostgreSQL Database** | PostgreSQL 16       | `localhost:5432`                   | —                                |
| **Redis Cache**         | Redis 7             | `localhost:6379`                   | —                                |
| **MinIO Console**       | S3 Storage          | `http://localhost:9001`            | —                                |

---

## 🐳 Docker Setup & Stack Management

You can run the entire platform stack in fully isolated Docker containers with a single command:

```bash
# Build and start all containerized services in detached mode
npm run docker:up

# View aggregated real-time logs across all containers
npm run docker:logs

# Rebuild containers after structural changes
npm run docker:build

# Stop and remove all running containers & networks
npm run docker:down
```

---

## 🧪 Available Scripts & Commands

All workspace tasks are managed centrally via root `package.json` and Turborepo:

| Script Command          | Description                                                                              |
| :---------------------- | :--------------------------------------------------------------------------------------- |
| `npm run dev`           | Boots all monorepo applications (`web`, `gateway`, `ai-service`) in parallel watch mode. |
| `npm run build`         | Compiles production bundles for all apps and shared packages.                            |
| `npm run lint`          | Runs ESLint checks across all TypeScript and JavaScript files.                           |
| `npm run lint:fix`      | Automatically fixes code lint errors across the workspace.                               |
| `npm run format`        | Formats all code files using Prettier according to root style definitions.               |
| `npm run format:check`  | Validates file formatting compliance without mutating files.                             |
| `npm run typecheck`     | Executes TypeScript type checking (`tsc --noEmit`) across all workspaces.                |
| `npm run test`          | Runs unit and integration tests across apps and packages using Vitest/Jest.              |
| `npm run test:watch`    | Runs test runner in interactive watch mode.                                              |
| `npm run test:coverage` | Generates detailed test coverage reports.                                                |
| `npm run clean`         | Cleans build output directories (`dist`, `.turbo`, `build`) and node modules.            |
| `npm run docker:up`     | Spins up the full multi-container stack via `docker-compose.yml`.                        |
| `npm run docker:down`   | Tears down running container instances.                                                  |
| `npm run changeset`     | Interactively generates a release changeset entry.                                       |

---

## 🗄️ Database Management & Prisma Studio

DevSync AI uses **Prisma ORM** for type-safe database queries and migration management.

```bash
# Navigate to API gateway workspace
cd apps/gateway

# Run database migrations in development
npx prisma migrate dev

# Generate Prisma Client TypeScript definitions
npx prisma generate

# Inspect and manage live database records in browser
npx prisma studio
```

Prisma Studio will launch at `http://localhost:5555`.

---

## 🤝 Contributing & Git Guidelines

We welcome contributions from the community! Please read our complete [Contributing Guide](docs/CONTRIBUTING.md) before submitting code.

### Branch Naming Conventions

- `feat/<short-description>` — New features (e.g. `feat/ai-diff-viewer`)
- `fix/<short-description>` — Bug fixes (e.g. `fix/ws-reconnect-loop`)
- `docs/<short-description>` — Documentation updates (e.g. `docs/api-spec`)
- `chore/<short-description>` — Dependency upgrades or tooling changes

### Conventional Commits Format

Every commit message must adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <short description>

[optional body details]

[optional issue reference]
```

**Example Commits**:

- `feat(gateway): implement Yjs document room state persistence`
- `fix(web): prevent terminal scroll jump on input`
- `docs(readme): add environment variable table and setup instructions`

Commits are validated automatically before commit via Husky `commit-msg` hooks.

---

## 🛡️ Security

Security is paramount for cloud-based code execution and real-time collaboration.
If you discover a security vulnerability, please refer to our [Security Policy](docs/SECURITY.md) for details on responsible disclosure. Do not open public issues for security vulnerabilities.

---

## 📄 License & Acknowledgments

Distributed under the **MIT License**. See [LICENSE](LICENSE) for full details.

Built with ❤️ by the **DevSync AI Contributors**.
