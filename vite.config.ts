import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@':          fileURLToPath(new URL('./src',             import.meta.url)),
      '@api':       fileURLToPath(new URL('./src/shared/api',  import.meta.url)),
      '@hooks':     fileURLToPath(new URL('./src/shared/hooks',import.meta.url)),
      '@pages':     fileURLToPath(new URL('./src/pages',       import.meta.url)),
      '@components':fileURLToPath(new URL('./src/components',  import.meta.url)),
      '@utils':     fileURLToPath(new URL('./src/utils',       import.meta.url)),
    },
  },

  /**
   * ──────────────────────────────────────────────
   *  ПРОКСИ: оставляем ТОЛЬКО /api/v1  →  бекенд
   * ──────────────────────────────────────────────
   */
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8080', // Spring‑сервер
        changeOrigin: true,              // подменяем Host‑заголовок
        secure: false,                   // выключаем https‑проверку на локалке
      },
    },
    hmr: { overlay: true },
  },
})
