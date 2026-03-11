import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'autoUpdate',
      injectManifest: {
        maximumFileSizeToCacheInBytes: 5000000,
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
manifest: {
  id: '/',
  name: 'Medical Student Study Planner',
  short_name: 'StudyPlanner',
  description: 'Manage study schedules, tasks, and spaced repetition.',
  theme_color: '#ffffff',
  background_color: '#ffffff',
  display: 'standalone',
  scope: '/',
  start_url: '/',
  orientation: 'portrait',
icons: [
  {
    src: '/pwa-192x192.png',
    sizes: '192x192',
    type: 'image/png'
  },
  {
    src: '/pwa-512x512.png',
    sizes: '512x512',
    type: 'image/png'
  },
  {
    src: '/pwa-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable'
  }
]
},

  icons: [
    {
      src: '/pwa-192x192.png',
      sizes: '192x192',
      type: 'image/png'
    },
    {
      src: '/pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png'
    },
    {
      src: '/pwa-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ],

  screenshots: [
    {
      src: '/screenshot1.png',
      sizes: '1280x720',
      type: 'image/png',
      form_factor: 'wide'
    }
  ]
}
    }),
  ],
});
