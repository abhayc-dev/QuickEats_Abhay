import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'leaflet', 'firebase/app', 'firebase/auth'],
  },
  server: {
    watch: {
      ignored: ['**/node_modules_broken/**', '**/node_modules/**'],
    },
  },
})
