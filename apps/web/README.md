# DevSync AI — Web Application

The **web** package is the primary user-facing frontend for DevSync AI, built with **Next.js 14** and the App Router.

## Overview

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | TBD — CSS Modules or Tailwind CSS |
| State | TBD — Zustand / Jotai |
| Testing | Jest + React Testing Library |
| Port (dev) | `3000` |

## Directory layout (target)

```
apps/web/
├── public/            # Static assets (fonts, images, icons)
├── src/
│   ├── app/           # App Router pages & layouts
│   ├── components/    # Feature-level React components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Browser-side utilities & API clients
│   ├── styles/        # Global CSS / design tokens
│   └── types/         # App-level type augmentations
├── next.config.js
├── package.json
└── tsconfig.json
```

## Scripts

```bash
npm run dev          # Start dev server on :3000
npm run build        # Production build
npm run start        # Serve the production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript typecheck
npm run test         # Jest unit tests
```

## Workspace dependencies

| Package | Role |
|---|---|
| `@devsync/shared-types` | Shared TypeScript interfaces & Zod schemas |
| `@devsync/shared-config` | Shared ESLint / Prettier / Jest configs |
| `@devsync/shared-ui` | Headless reusable UI components |
