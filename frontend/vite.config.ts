import fs from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const hasCerts = fs.existsSync('./certs/key.pem') && fs.existsSync('./certs/cert.pem')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    // HTTPS local solo si existen los certificados (no existen en Render/CI).
    https: hasCerts
      ? {
          key: fs.readFileSync('./certs/key.pem'),
          cert: fs.readFileSync('./certs/cert.pem'),
        }
      : undefined,
    // El front llama a "/api/..." y Vite lo reenvía al backend FastAPI.
    // Así no hay problemas de CORS y no se escribe la URL del backend en el código.
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
