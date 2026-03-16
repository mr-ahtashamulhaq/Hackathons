import react from '@vitejs/plugin-react'
import {fileURLToPath, URL} from 'node:url'
import {defineConfig} from 'vite'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    host: true,  // allow external connections (ngrok)
    port: 5173,
    strictPort: true,
    allowedHosts: true,  // allow all hosts including ngrok domains
  },

  preview: {
    host: true,
    port: 4173,
    strictPort: true,
  },

  build: {
    target: 'esnext',
    sourcemap: true,
  },
})