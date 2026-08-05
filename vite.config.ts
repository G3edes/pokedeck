import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) return 'charts-vendor'
            if (id.includes('react-router') || id.includes('/react/') || id.includes('/react-dom/')) return 'react-vendor'
            if (id.includes('@tanstack') || id.includes('axios') || id.includes('zustand')) return 'query-vendor'
          }
          return undefined
        },
      },
    },
  },
})
