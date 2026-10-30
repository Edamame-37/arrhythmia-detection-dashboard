import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.DEV_API_TARGET || 'http://127.0.0.1:8081';
  const proxyAuth = env.VITE_SUPABASE_URL === '/supabase';
  if (proxyAuth && !env.VITE_ACTUAL_SUPABASE_URL?.startsWith('https://')) {
    throw new Error(
      'VITE_ACTUAL_SUPABASE_URL must be HTTPS when using /supabase',
    );
  }
  return {
    server: {
      host: '127.0.0.1',
      proxy: {
        '/api': { target },
        '/uploads': { target },
        '/ws': { target, ws: true },
        ...(proxyAuth
          ? {
              '/supabase': {
                target: env.VITE_ACTUAL_SUPABASE_URL,
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/supabase/, ''),
              },
            }
          : {}),
      },
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'prompt',
        injectRegister: 'script',
        includeAssets: ['pwa-192x192.png', 'pwa-512x512.png'],
        manifest: {
          name: 'ECGRhythmia',
          short_name: 'ECGRhythmia',
          description: 'Pemantauan rekaman ECG',
          theme_color: '#ffffff',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
          maximumFileSizeToCacheInBytes: 1024 * 1024,
          navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//, /^\/ws/],
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            if (
              id.includes('node_modules/html5-qrcode') ||
              id.includes('node_modules/react-qr-code')
            )
              return 'qr';
            if (id.includes('node_modules/@supabase')) return 'auth';
            if (/node_modules[\\/](react|react-dom|react-router)/.test(id))
              return 'react';
          },
        },
      },
    },
  };
});
