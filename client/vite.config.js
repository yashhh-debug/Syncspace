import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  optimizeDeps: {
    // Force Vite to pre-bundle these packages correctly
    include: [
      'monaco-editor/esm/vs/editor/editor.api',
      'monaco-editor/esm/vs/editor/editor.main',
      'y-monaco',
    ],
  },
  resolve: {
    alias: {
      // Help Vite resolve the deep import that y-monaco uses
      'monaco-editor': 'monaco-editor',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor'],
        },
      },
    },
  },
});