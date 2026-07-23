# ⚡ DevSync AI — Real-Time Collaborative AI-Powered Cloud IDE

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.10+-009688.svg)](https://fastapi.tiangolo.com/)

**DevSync AI** is a next-generation, cloud-native collaborative Code Editor and IDE. Built as a high-performance monorepo, it seamlessly blends real-time multiplayer code editing (Yjs + WebSockets) with intelligent multi-agent AI pair-programming, RAG codebase indexing, integrated web terminals, and full admin capabilities.

---

## ✨ Features Overview

### 👥 Real-Time Multiplayer Collaboration

- **Yjs Shared Documents**: Concurrent multi-user code editing with instant Conflict-Free Replicated Data Type (CRDT) synchronization.
- **Presence & Remote Cursors**: See active workspace collaborators, their cursor positions, and current selections in real time.
- **Activity & Timeline Feeds**: Track workspace events, member joins, and file changes continuously.

### 🤖 Autonomous Multi-Agent AI & Pair Programmer

- **Multi-Agent Orchestration**: Specialized agents (Planner, Coder, Critic/Auditor) collaborate to analyze tasks and produce high-quality solutions.
- **One-Click & Auto Code Application**: AI-suggested code snippets can be automatically applied directly to your active editor files.
- **Interactive AI Chat**: Real-time streaming responses, markdown rendering, and code syntax highlighting.

### 📚 RAG (Retrieval-Augmented Generation) Codebase Indexing

- **Semantic Code Search**: Deep context retrieval across workspace codebases using vector embeddings (ChromaDB / SentenceTransformers).
- **Document & Repository Ingestion**: Ingest project files and PDFs into vector stores for grounded, accurate AI answers with source citations.

### 💻 Embedded Web Terminal & Container Service

- **Interactive Shell (XTerm.js)**: Full-featured browser terminal connected to backend execution environments via WebSockets.
- **Docker Container Management**: Monitor, launch, and manage Docker containers directly from the IDE interface.

### 🌿 Built-in Source Control (Git Integration)

- **Visual Git Panel**: View staged/unstaged changes, inspect line-by-line diffs, commit with conventional commit format, and manage branches.
- **Git History**: Browse repository commit logs directly within the IDE.

### 🛡️ Admin Dashboard & Analytics

- **System Health Monitoring**: Live metrics for API Gateway, AI Service, database, and Redis.
- **User & Workspace Governance**: Manage users, roles, workspace permissions, and audit logs.

---

## 🛠️ Architecture & Monorepo Structure

```text
DevSync_AI/
├── apps/
│   ├── web/               # React 19 + Vite + Tailwind CSS + Zustand + XTerm.js (Frontend)
│   ├── gateway/           # Node.js + Express + Socket.io + Prisma (API & Collaboration Gateway)
│   └── ai-service/        # Python 3.10+ + FastAPI + LangChain + ChromaDB (AI & RAG Service)
├── packages/
│   ├── shared-types/      # Centralized TypeScript definitions across web and gateway
│   ├── shared-config/     # Shared ESLint, Prettier, and TypeScript configurations
│   └── shared-ui/         # Shared UI components component library
├── docker/                # Development Docker stack & persistent volumes
└── docker-compose.yml     # Multi-container orchestration (Web, Gateway, AI Service, Redis)
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed locally:

- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`
- **Python**: `>= 3.10`
- **Docker Desktop** _(Optional, required for containerized deployment & Redis)_

---

### Quick Start (Local Setup)

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Yash-kumar123/DevSync_AI.git
   cd DevSync_AI
   ```

2. **Install Node dependencies**:

   ```bash
   npm install
   ```

3. **Set up Python AI Service environment**:

   ```bash
   cd apps/ai-service
   python -m venv .venv

   # Windows (PowerShell)
   .venv\Scripts\Activate.ps1
   # macOS / Linux
   # source .venv/bin/activate

   python -m pip install --upgrade pip
   python -m pip install -e ".[dev]"
   cd ../..
   ```

4. **Configure Environment Variables**:
   Copy the example environment files to enable local defaults:

   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env
   Copy-Item apps/gateway/.env.example apps/gateway/.env
   Copy-Item apps/ai-service/.env.example apps/ai-service/.env

   # Linux / macOS
   # cp .env.example .env
   # cp apps/gateway/.env.example apps/gateway/.env
   # cp apps/ai-service/.env.example apps/ai-service/.env
   ```

5. **Start All Services in Development Mode**:
   ```bash
   npm run dev
   ```

---

## 🌐 Service Ports & Access Points

| Service / App       | Tech Stack          | URL / Endpoint                     |
| :------------------ | :------------------ | :--------------------------------- |
| **Web Frontend**    | React 19 + Vite     | `http://localhost:3000`            |
| **API Gateway**     | Express + Socket.io | `http://localhost:4000`            |
| **Gateway Health**  | REST Endpoint       | `http://localhost:4000/api/health` |
| **AI Service**      | FastAPI + Uvicorn   | `http://localhost:5000`            |
| **AI Health Check** | REST Endpoint       | `http://localhost:5000/api/health` |
| **Redis Cache**     | Docker / Native     | `localhost:6379`                   |

---

## 🐳 Docker Stack

Run the full platform stack locally inside Docker containers with live hot-reloading:

```bash
# Start all services
npm run docker:up

# View combined container logs
npm run docker:logs

# Stop services
npm run docker:down
```

---

## 🧪 Scripts & Quality Assurance

| Command             | Description                                                  |
| :------------------ | :----------------------------------------------------------- |
| `npm run dev`       | Starts all monorepo applications in parallel using Turborepo |
| `npm run build`     | Builds production bundles for all apps and packages          |
| `npm run lint`      | Runs ESLint across all JavaScript/TypeScript workspaces      |
| `npm run format`    | Formats all files using Prettier                             |
| `npm run typecheck` | Validates TypeScript types workspace-wide                    |
| `npm run clean`     | Cleans build artifacts and caches                            |

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
