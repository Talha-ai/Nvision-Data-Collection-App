import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      external: ['aws-sdk'],
    },
    assetsDir: 'assets',
  },
  publicDir: 'public',
});
