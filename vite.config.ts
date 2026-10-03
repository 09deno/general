import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    // Appka sa dá pridať na plochu a uloží sa v telefóne, takže sa spúšťa rýchlo.
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Fit denník',
        short_name: 'Fit denník',
        description: 'Denník jedla a tréningu pre partiu.',
        lang: 'sk',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#050507',
        theme_color: '#050507',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // úvodné obrazovky iPhonu sa do telefónu neukladajú – stiahnu sa len pri pridaní na plochu
        globPatterns: ['**/*.{js,css,html,woff2,svg}', 'icons/*.png', 'apple-touch-icon.png'],
        navigateFallback: '/index.html',
      },
    }),
  ],
})
