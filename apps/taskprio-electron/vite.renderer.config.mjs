import { defineConfig } from 'vite';
import path from 'node:path';
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import tanstackRouter from "@tanstack/router-plugin/vite"

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: path.resolve(__dirname, './src/renderer/src/routesTanstack'),
      autoCodeSplitting: false,
    }),
    react(),
    tailwindcss()
  ],
  root: path.resolve(__dirname, './src/renderer'),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer/src'),
    }
  },
  server: {
    port: 5001,
    strictPort: true,
  },
  build: {
    outDir: path.resolve(__dirname, `./.vite/dist/renderer/main_window`),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        // Add any other dependencies that should be externalized
      ]
    }
  },
  base: "./",
});
