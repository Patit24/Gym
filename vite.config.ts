import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'icons-vendor': ['lucide-react'],
          'ui-vendor': ['framer-motion', 'clsx', 'tailwind-merge', 'canvas-confetti']
        }
      }
    }
  }
});
