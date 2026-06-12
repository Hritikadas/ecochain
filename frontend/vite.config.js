import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'; // 🎯 Native Tailwind v4 compiler hook

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // 🚀 Compiles your updated index.css design tokens smoothly
  ],
  server: {
    port: 5174, // Forces your frontend client to stay locked on port 5174
    strictPort: true, // Prevents port collisions from shifting your network routing
    proxy: {
      // 🌐 AUTOMATED REVERSE PROXY PIPELINE:
      // Catches all relative front-facing /api fetch strings and intercepts them 
      // directly into your live SQLite/Express server context on port 3001.
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});