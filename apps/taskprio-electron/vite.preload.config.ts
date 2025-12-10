import { defineConfig } from 'vite';
import path from "node:path";

// https://vitejs.dev/config
export default defineConfig({
    resolve: {
        alias: {
        'src': path.resolve(__dirname, './src')
        }
    }
});
