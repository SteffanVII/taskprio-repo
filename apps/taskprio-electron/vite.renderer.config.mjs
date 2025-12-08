import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: path.resolve(__dirname, '../../apps/taskprio-fe'),
  server: {
    port: 5001,
    strictPort: true,
  },
  build: {
    outDir: path.resolve(__dirname, `./.vite/dist/renderer/main_window`),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../../apps/taskprio-fe/src'),
    },
  }
});
