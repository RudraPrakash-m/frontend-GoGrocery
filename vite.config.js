import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router-dom/') ||
              id.includes('/@reduxjs/toolkit/') ||
              id.includes('/react-redux/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('/@tanstack/react-query/')) {
              return 'vendor-query';
            }
            if (id.includes('/recharts/')) {
              return 'vendor-charts';
            }
            if (id.includes('/@zxing/')) {
              return 'vendor-scanner';
            }
            if (id.includes('/crypto-js/')) {
              return 'vendor-crypto';
            }
          }
        },
      },
    },
  },
});
