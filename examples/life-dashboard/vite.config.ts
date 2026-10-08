import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The API server (server/index.ts) listens here; Vite forwards to it so the
// dashboard and the OAuth redirect share one origin.
const api = 'http://127.0.0.1:8787'
const proxy = { '/api': api, '/auth': api }

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { proxy },
  preview: { proxy },
})
