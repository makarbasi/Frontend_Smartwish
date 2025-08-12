import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/gemini-inpaint': 'http://localhost:3001',
      '/openai-edit': 'http://localhost:3001',
      '/save-image': 'http://localhost:3001',
      '/load-images': 'http://localhost:3001',
      '/print-pc': 'http://localhost:3001',
      '/get-printers': 'http://localhost:3001',
      '/submit-print-job': 'http://localhost:3001',
      '/print-jobs': 'http://localhost:3001',
      '/proxy': 'http://localhost:3001',
      '/upload-media': 'http://localhost:3001',
      '/validate-media-qr': 'http://localhost:3001',
      '/save-images': 'http://localhost:3001',
      '/downloads': 'http://localhost:3001',
      '/search-templates': 'http://localhost:3001',
      '/contacts': 'http://localhost:3001',
      '/marketplace': 'http://localhost:3001',
      '/auth': 'http://localhost:3001',
      '/user': 'http://localhost:3001',
      '/saved-designs': 'http://localhost:3001',
      '/api/templates': 'http://localhost:3001',
      '/api/categories': 'http://localhost:3001',
      '/api/sharing': 'http://localhost:3001',
    }
  }
})
