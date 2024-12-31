import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import pkg from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/assets/styles/_vars.css";
          @use "@/assets/styles/reset.scss";
        `
      }
    },
  },
  server: {
    hmr: true
  },
  logLevel: 'info',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version), // Injection de la version
  },
})
