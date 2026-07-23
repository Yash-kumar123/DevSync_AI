# DevSync AI

DevSync AI is a development monorepo containing a React frontend, an Express and Socket.io gateway, and a FastAPI service prepared for future AI integrations.

## Stack

- `apps/web` - React 19, Vite, TypeScript, Tailwind CSS
- `apps/gateway` - Node.js, Express, Socket.io, TypeScript
- `apps/ai-service` - Python, FastAPI, Ollama/LangChain/LangGraph/ChromaDB-ready
- `packages/*` - shared types, configuration, and UI package boundaries
- Docker Compose - development containers for the applications and Redis

## Prerequisites

- Node.js 20 or newer and npm 10 or newer
- Python 3.10 or newer
- Docker Desktop (optional, for the containerized development stack)

## Installation

Install the JavaScript workspace dependencies:

```bash
npm install
```

Create and activate a Python virtual environment, then install the AI service dependencies:

```bash
cd apps/ai-service
python -m venv .venv
# Windows PowerShell
.venv\Scripts\Activate.ps1
# macOS/Linux
# source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e ".[dev]"
cd ../..
```

Copy the environment examples if you need to change their defaults:

```bash
copy .env.example .env
copy apps\gateway\.env.example apps\gateway\.env
copy apps\ai-service\.env.example apps\ai-service\.env
```

On macOS/Linux, use `cp` instead of `copy`.

## Start development

Start all workspace services from the repository root:

```bash
npm run dev
```

Or run services individually:

```bash
npm run dev --workspace @devsync/web
npm run dev --workspace @devsync/gateway
npm run dev --workspace @devsync/ai-service
```

| Service                 | Address                          |
| ----------------------- | -------------------------------- |
| Web                     | http://localhost:3000            |
| Gateway health check    | http://localhost:4000/api/health |
| AI service health check | http://localhost:5000/api/health |

## Docker development stack

Docker uses bind mounts and hot reload; it is intended for development only.

```bash
npm run docker:up
npm run docker:logs
npm run docker:down
```

This starts `frontend`, `gateway`, `ai-service`, and Redis. Configure a local Ollama installation through `OLLAMA_BASE_URL` when AI functionality is added.

## Quality checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Husky runs lint-staged before commits and validates commit messages against Conventional Commits.
