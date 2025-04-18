import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['editor.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Image Editor App',
        short_name: 'Image Editor',
        description: 'A simple image editor application',
        theme_color: '#ffffff',
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "pwa-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/www.gstatic.com\/firebasejs\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-scripts',
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    })
  ],
  base: "/2025-1-s1-g2-t2/",
  assetsInclude: ['**/*.wasm'], // 👈 esto es clave
})
