import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Relative base so the build works at https://<user>.github.io/<repo>/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        crops: resolve(import.meta.dirname, 'crops.html'),
      },
    },
  },
});
