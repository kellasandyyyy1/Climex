import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

// Exact dark background from src/index.css (.dark --bg-base)
const THEME_DARK = '#1C1B19';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        // Updates wait for the user ("Refresh" in the update toast); registration is done in src/components/PwaManager.tsx
        registerType: 'prompt',
        injectRegister: false,
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest,woff2}'],
          // Large marketing images are cached at runtime instead of on install
          globIgnores: ['**/img/**', '**/screenshots/**', '**/icons/icon-512.png', '**/icons/climex-wordmark-on-dark.png'],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        },
        // The service worker stays off in development (avoids stale caches) unless VITE_PWA_DEV=true
        devOptions: {
          enabled: process.env.VITE_PWA_DEV === 'true',
          type: 'module',
          navigateFallback: 'index.html',
        },
        manifest: {
          id: '/',
          name: 'Climex',
          short_name: 'Climex',
          description: 'Crypto, weather, currency, countries and air quality in one dashboard',
          start_url: '/?source=pwa',
          scope: '/',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'standalone'],
          orientation: 'any',
          background_color: THEME_DARK,
          theme_color: THEME_DARK,
          categories: ['finance', 'weather', 'utilities'],
          icons: [
            { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
          screenshots: [
            { src: '/screenshots/dashboard-wide.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide', label: 'Climex dashboard on desktop' },
            { src: '/screenshots/dashboard-narrow.png', sizes: '750x1334', type: 'image/png', form_factor: 'narrow', label: 'Climex dashboard on mobile' },
          ],
          shortcuts: [
            { name: 'Crypto', short_name: 'Crypto', description: 'Live coin prices and 24h moves', url: '/crypto?source=pwa-shortcut', icons: [{ src: '/icons/pwa-96x96.png', sizes: '96x96', type: 'image/png' }] },
            { name: 'Weather', short_name: 'Weather', description: 'Conditions and 7-day forecasts', url: '/weather?source=pwa-shortcut', icons: [{ src: '/icons/pwa-96x96.png', sizes: '96x96', type: 'image/png' }] },
            { name: 'Currency', short_name: 'Currency', description: 'Exchange rates and converter', url: '/currency?source=pwa-shortcut', icons: [{ src: '/icons/pwa-96x96.png', sizes: '96x96', type: 'image/png' }] },
            { name: 'Air Quality', short_name: 'Air', description: 'AQI and health guidance', url: '/air-quality?source=pwa-shortcut', icons: [{ src: '/icons/pwa-96x96.png', sizes: '96x96', type: 'image/png' }] },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    // `vite preview` (production build check) forwards API + live updates to the Express server on :3000
    preview: {
      proxy: {
        '/api': 'http://127.0.0.1:3000',
        '/ws': {target: 'ws://127.0.0.1:3000', ws: true},
      },
    },
  };
});
