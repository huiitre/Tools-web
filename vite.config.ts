import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  vueDevtools: true,
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          // @use "@/assets/styles/font-awesome5.15.4.css";
          @use "@/assets/styles/_vars.css";
          @use "@/assets/styles/reset.scss";
          // @use "./assets/styles/main.scss";
        `
      }
    },
  }
})
