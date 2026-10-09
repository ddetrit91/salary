import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // автообновление SW при каждом деплое
      includeAssets: ['favicon.svg', 'icons/*.png'],

      manifest: {
        name: 'Salary Tracker',
        short_name: 'Трекер',
        description: 'Учёт доходов и расходов',
        theme_color: '#4361ee',
        background_color: '#ffffff',
        display: 'standalone', // запуск как приложение (без адресной строки)
        orientation: 'any',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/icon-192x192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Кэшируем только статику — JS/CSS/шрифты/изображения
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Не кэшируем API — данные должны приходить свежими
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i,
            handler: 'NetworkFirst', // сначала сеть, потом кэш (на случай офлайна)
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, // 5 мин
            },
          },
        ],
      },
    }),
  ],
});