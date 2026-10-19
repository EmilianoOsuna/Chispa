import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), VitePWA({
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.ts',
    registerType: 'prompt',
    injectManifest: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'] },
    devOptions: { enabled: true, type: 'module' },
    manifest: {
      name: 'Chispa',
      short_name: 'Chispa',
      description: 'Rachas de hábitos en pareja',
      lang: 'es-MX',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: '#F3F5FA',
      background_color: '#F3F5FA',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
  }), cloudflare()],
  server: { port: 5173 },
})