import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cssInjectedByJsPlugin(),
  ],
  build: {
    // Keep handwriting available when the UI bundle is served from a CDN.
    assetsInlineLimit: 2000000,
    // Generate a single JS file and no CSS file (CSS inlined into JS)
    rollupOptions: {
      input: "notebook.html",
      output: {
        entryFileNames: 'showcase-ui.js',
        assetFileNames: '[name].[ext]',
        chunkFileNames: '[name].js',
      },
    },
  },
});
