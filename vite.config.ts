import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Eigenes Repo "fynnox-adventure" -> gehostet unter marcel-fe.github.io/fynnox-adventure/.
// base steuert alle Asset-Pfade (lokal '/', auf GitHub Pages '/fynnox-adventure/').
export default defineConfig({
  base: '/fynnox-adventure/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Fynnox Adventure',
        short_name: 'Fynnox',
        description: 'Fynnox-Fuchs-Abenteuer: laufen, springen, sammeln.',
        lang: 'de',
        theme_color: '#2f8f4e',
        background_color: '#bcd6f0',
        display_override: ['fullscreen', 'standalone'],
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/fynnox-adventure/',
        scope: '/fynnox-adventure/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        cacheId: 'fynnox-adventure', // eindeutige Cache-Namen (getrennt von anderen Apps der Domain)
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,png,svg,woff2,glb,mp3}'],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
      },
    }),
  ],
  server: { host: true },
})
