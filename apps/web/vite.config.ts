import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // -------------------------------------------------------------------------
  // Path aliases — must mirror tsconfig.json "paths" exactly
  // -------------------------------------------------------------------------
  resolve: {
    alias: {
      'monaco-editor/esm/vs/editor/editor.api.js': 'monaco-editor',
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@store': path.resolve(__dirname, './src/store'),
      '@utils': path.resolve(__dirname, './src/utils'),
      // Bare @types resolves to the barrel index for named imports
      '@types': path.resolve(__dirname, './src/types/index.ts'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@context': path.resolve(__dirname, './src/context'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },

  // -------------------------------------------------------------------------
  // Development server & Proxy Routing
  // -------------------------------------------------------------------------
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    open: false,
    proxy: {
      // AI Service microservice (Python FastAPI)
      '/api/ai': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/api/rag': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      // Socket.io real-time WebSocket connection to gateway
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true,
      },
      // Proxy API calls to gateway (Express)
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },

  // -------------------------------------------------------------------------
  // Build
  // -------------------------------------------------------------------------
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          query: ['@tanstack/react-query'],
          motion: ['framer-motion'],
          zustand: ['zustand'],
          collaboration: ['socket.io-client', 'yjs', 'y-monaco', 'y-protocols/awareness'],
        },
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  optimizeDeps: {
    include: [
      'socket.io-client',
      'yjs',
      'y-monaco',
      'y-protocols/awareness',
      '@monaco-editor/react',
    ],
  },

  // -------------------------------------------------------------------------
  // Preview (vite preview)
  // -------------------------------------------------------------------------
  preview: {
    port: 3000,
    strictPort: true,
  },

  // -------------------------------------------------------------------------
  // Test (Vitest)
  // -------------------------------------------------------------------------
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
  },
});
