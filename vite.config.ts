import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({ targets: [{ src: 'external/codisec', dest: '.' }] }),
  ],
  optimizeDeps: { exclude: ['lucide-react'] },
  server: {
    host: true,
    port: 5173,
    proxy: { '/api': { target: 'http://localhost:5175', changeOrigin: true } },
  },
});
