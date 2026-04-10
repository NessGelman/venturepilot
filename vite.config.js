import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/venturepilot/',

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Increase warning threshold — WebLLM chunks are intentionally large
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split heavy vendor libs into separate cacheable chunks
        manualChunks: (id) => {
          // WebLLM is dynamically imported — let Rolldown own its chunk, don't absorb it
          if (id.includes('@mlc-ai')) return undefined;

          // Recharts + d3 dependencies → charting chunk
          if (id.includes('recharts') || id.includes('node_modules/d3-') || id.includes('victory-vendor')) {
            return 'vendor-charts';
          }
          // Framer Motion → animation chunk
          if (id.includes('framer-motion')) {
            return 'vendor-motion';
          }
          // React core → framework chunk (most stable, best cache hit rate)
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router')
          ) {
            return 'vendor-react';
          }
          // Everything else in node_modules → shared vendor chunk
          if (id.includes('node_modules')) {
            return 'vendor-shared';
          }
        },
      },
    },
  },

  // Optimise dev server for large deps
  optimizeDeps: {
    exclude: ['@mlc-ai/web-llm'], // Loaded dynamically at runtime — don't pre-bundle
  },
});
