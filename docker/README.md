# docker/

This directory contains **all Docker-related configuration** for local development and production deployments.

## Structure

```
docker/
├── postgres/
│   └── init/
│       └── 00_init.sql       # PostgreSQL bootstrap SQL (extensions, roles)
├── redis/                    # (future) Custom redis.conf if needed
├── traefik/                  # (future) Traefik static & dynamic config
└── nginx/                    # (future) NGINX config for production reverse proxy
```

## Conventions

| Rule | Detail |
|---|---|
| Init scripts | Numbered `00_`, `01_`, etc. — executed in order by the DB engine |
| Volumes | Defined in `docker-compose.yml` at repo root — never committed |
| Secrets | Injected via `.env` — never hard-coded in Dockerfiles or SQL |

## Starting the stack

```bash
# From the repo root
npm run docker:up        # Start all containers in background
npm run docker:logs      # Stream logs
npm run docker:down      # Stop and remove containers (volumes persist)
```

## Ports reference

| Service | Host port | Container port |
|---|---|---|
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| MinIO API | 9000 | 9000 |
| MinIO Console | 9001 | 9001 |
| Traefik HTTP | 80 | 80 |
| Traefik Dashboard | 8080 | 8080 |
