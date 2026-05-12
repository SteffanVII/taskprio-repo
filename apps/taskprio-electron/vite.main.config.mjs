import { defineConfig } from 'vite';
import path from "node:path"
import { loadEnv } from 'vite';

// https://vitejs.dev/config
export default defineConfig(({ mode }) => {

  const env = loadEnv(mode, process.cwd(), '')

  return {
    resolve: {
      alias: {
        'src': path.resolve(__dirname, './src')
      }
    },
    define: {
      ...Object.keys(env).reduce((acc, key) => {
        acc[`process.env.${key}`] = JSON.stringify(env[key]);
        return acc;
      }, {}),
    },
    build: {
      rollupOptions: {
        external: ['utf-8-validate', 'bufferutil']
      }
    }
  }
});