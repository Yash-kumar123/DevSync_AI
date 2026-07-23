/**
 * @file src/types/env.types.ts
 * Type-safe environment variable declarations.
 * Vite exposes env vars through import.meta.env — augment the interface here.
 */

/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    // App
    readonly VITE_APP_NAME: string;
    readonly VITE_APP_VERSION: string;

    // API endpoints
    readonly VITE_GATEWAY_HTTP_URL: string;
    readonly VITE_GATEWAY_WS_URL: string;

    // Feature flags
    readonly VITE_ENABLE_DEVTOOLS: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
