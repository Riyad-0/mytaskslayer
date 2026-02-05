import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Allow vite to clear the output dir contents even when it is outside the
    // project root folder. This allows the static files to be placed into the
    // api folder and deleted on rebuild.
    emptyOutDir: true,
    
    outDir: '../api/public'
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
