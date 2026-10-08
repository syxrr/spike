import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Single self-contained IIFE: React, the avatar renderer, the definition and all
// CSS are bundled in, so the widget drops into any page with one <script> tag.
export default defineConfig({
  plugins: [react()],
  define: { 'process.env.NODE_ENV': '"production"' },
  build: {
    lib: { entry: 'src/mount.tsx', name: 'SpikeAvatar', formats: ['iife'], fileName: () => 'spike-avatar.js' },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
})
