import fs from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    https: {
      key: fs.readFileSync('./certs/key.pem'),
      cert: fs.readFileSync('./certs/cert.pem'),
    },
    // El front llama a "/api/..." y Vite lo reenvía al backend FastAPI.
    // Así no hay problemas de CORS y no se escribe la URL del backend en el código.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
