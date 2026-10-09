import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// The API server (server/index.ts) listens here; Vite forwards to it so the
// dashboard and the OAuth redirect share one origin.
const api = 'http://127.0.0.1:8787'
const proxy = { '/api': api, '/auth': api }

const INK = '#08090a'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Installable app + offline shell. Only the built app is cached: feed data
    // is cached by the dashboard itself, and /api and /auth always hit the
    // network so sign-in redirects are never answered from cache.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['spike.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Spike — life dashboard',
        short_name: 'Spike',
        description: 'Email, calendar, to-dos, medication and the rest of life admin in one place.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        background_color: INK,
        theme_color: INK,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: { proxy },
  preview: { proxy },
})
