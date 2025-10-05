// vite.config.ts
import { defineConfig } from "file:///D:/wamp64/www/dev/perso/Tools-web/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/wamp64/www/dev/perso/Tools-web/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { resolve } from "path";

// package.json
var package_default = {
  name: "Tools",
  private: true,
  version: "0.9.0",
  type: "module",
  scripts: {
    dev: "vite --host",
    build: "vue-tsc && vite build",
    "build:android": "vue-tsc && vite build && cp -R ./dist/* ../../pro/distrilog/EasyMobile2.0/www/",
    deploy: "vue-tsc && vite build && python deploy.py",
    preview: "vite preview",
    "lint:script": "eslint --ext .ts,vue --ignore-path .gitignore .",
    "lint:markup": "vue-tsc --noEmit",
    reset: "rm -rf node_modules package-lock.json"
  },
  dependencies: {
    "@fortawesome/fontawesome-svg-core": "^6.4.0",
    "@fortawesome/free-brands-svg-icons": "^6.4.0",
    "@fortawesome/free-regular-svg-icons": "^6.4.0",
    "@fortawesome/free-solid-svg-icons": "^6.4.0",
    "@fortawesome/vue-fontawesome": "^3.0.3",
    axios: "^1.1.3",
    echarts: "^6.0.0",
    "mosha-vue-toastify": "^1.0.23",
    vue: "^3.2.47",
    "vue-router": "^4.2.2",
    vuetify: "^3.7.4",
    vuex: "^4.1.0"
  },
  devDependencies: {
    "@types/node": "^18.19.68",
    "@typescript-eslint/eslint-plugin": "^5.43.0",
    "@typescript-eslint/parser": "^5.43.0",
    "@vitejs/plugin-vue": "^3.2.0",
    "@vue/eslint-config-prettier": "^7.0.0",
    "@vue/eslint-config-typescript": "^11.0.2",
    eslint: "^8.27.0",
    "eslint-plugin-prettier": "^4.2.1",
    "eslint-plugin-vue": "^9.7.0",
    husky: "^8.0.2",
    "lint-staged": "^13.0.3",
    prettier: "^2.7.1",
    sass: "^1.56.1",
    typescript: "^4.6.4",
    vite: "^3.2.3",
    "vite-plugin-pwa": "^0.21.1",
    "vue-tsc": "^1.0.9"
  },
  "lint-staged": {
    "*.{ts,vue}": "eslint --fix",
    "*": "prettier -w -u"
  }
};

// vite.config.ts
import { VitePWA } from "file:///D:/wamp64/www/dev/perso/Tools-web/node_modules/vite-plugin-pwa/dist/index.js";
var __vite_injected_original_dirname = "D:\\wamp64\\www\\dev\\perso\\Tools-web";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Tools",
        short_name: "huiitre.fr",
        description: "Tools - huiitre.fr",
        theme_color: "#42b883",
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/assets/styles/_vars.css";
          @use "@/assets/styles/reset.scss";
          @use "@/assets/styles/light-icon.css";
        `
      }
    }
  },
  server: {
    hmr: true,
    host: true,
    port: 5173
  },
  logLevel: "info",
  define: {
    __APP_VERSION__: JSON.stringify(package_default.version)
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx3YW1wNjRcXFxcd3d3XFxcXGRldlxcXFxwZXJzb1xcXFxUb29scy13ZWJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHdhbXA2NFxcXFx3d3dcXFxcZGV2XFxcXHBlcnNvXFxcXFRvb2xzLXdlYlxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovd2FtcDY0L3d3dy9kZXYvcGVyc28vVG9vbHMtd2ViL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xyXG5pbXBvcnQgcGtnIGZyb20gJy4vcGFja2FnZS5qc29uJ1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJ1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICB2dWUoKSxcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcclxuICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICBuYW1lOiBcIlRvb2xzXCIsXHJcbiAgICAgICAgc2hvcnRfbmFtZTogXCJodWlpdHJlLmZyXCIsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IFwiVG9vbHMgLSBodWlpdHJlLmZyXCIsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6IFwiIzQyYjg4M1wiLFxyXG4gICAgICAgIGljb25zOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIHNyYzogXCIvcHdhLTE5MngxOTIucG5nXCIsXHJcbiAgICAgICAgICAgIHNpemVzOiBcIjE5MngxOTJcIixcclxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIlxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiBcIi9wd2EtNTEyeDUxMi5wbmdcIixcclxuICAgICAgICAgICAgc2l6ZXM6IFwiNTEyeDUxMlwiLFxyXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgc2tpcFdhaXRpbmc6IHRydWUsXHJcbiAgICAgICAgY2xpZW50c0NsYWltOiB0cnVlLFxyXG4gICAgICAgIHJ1bnRpbWVDYWNoaW5nOiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIC8vIEV4ZW1wbGUgZGUgbWlzZSBlbiBjYWNoZSBkZXMgaW1hZ2VzXHJcbiAgICAgICAgICAgIHVybFBhdHRlcm46ICh7IHJlcXVlc3QgfSkgPT4gcmVxdWVzdC5kZXN0aW5hdGlvbiA9PT0gJ2ltYWdlJyxcclxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnaW1hZ2VzLWNhY2hlJyxcclxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7XHJcbiAgICAgICAgICAgICAgICBtYXhFbnRyaWVzOiA1MCxcclxuICAgICAgICAgICAgICAgIG1heEFnZVNlY29uZHM6IDMwICogMjQgKiA2MCAqIDYwLCAvLyAzMCBqb3Vyc1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgY3NzOiB7XHJcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgIHNjc3M6IHtcclxuICAgICAgICBhZGRpdGlvbmFsRGF0YTogYFxyXG4gICAgICAgICAgQHVzZSBcIkAvYXNzZXRzL3N0eWxlcy9fdmFycy5jc3NcIjtcclxuICAgICAgICAgIEB1c2UgXCJAL2Fzc2V0cy9zdHlsZXMvcmVzZXQuc2Nzc1wiO1xyXG4gICAgICAgICAgQHVzZSBcIkAvYXNzZXRzL3N0eWxlcy9saWdodC1pY29uLmNzc1wiO1xyXG4gICAgICAgIGBcclxuICAgICAgfVxyXG4gICAgfSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG1yOiB0cnVlLFxyXG4gICAgaG9zdDogdHJ1ZSxcclxuICAgIC8qIGh0dHBzOiB7XHJcbiAgICAgIGtleTogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdjZXJ0cy8xOTIuMTY4LjEuMzAta2V5LnBlbScpKSxcclxuICAgICAgY2VydDogZnMucmVhZEZpbGVTeW5jKHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdjZXJ0cy8xOTIuMTY4LjEuMzAucGVtJykpXHJcbiAgICB9LCAqL1xyXG4gICAgcG9ydDogNTE3MyxcclxuICB9LFxyXG4gIGxvZ0xldmVsOiAnaW5mbycsXHJcbiAgZGVmaW5lOiB7XHJcbiAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KHBrZy52ZXJzaW9uKSwgLy8gSW5qZWN0aW9uIGRlIGxhIHZlcnNpb25cclxuICB9LFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWlTLFNBQVMsb0JBQW9CO0FBQzlULE9BQU8sU0FBUztBQUNoQixTQUFTLGVBQWU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFeEIsU0FBUyxlQUFlO0FBSnhCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFNBQVM7QUFBQSxRQUNQLGFBQWE7QUFBQSxRQUNiLGNBQWM7QUFBQSxRQUNkLGdCQUFnQjtBQUFBLFVBQ2Q7QUFBQSxZQUVFLFlBQVksQ0FBQyxFQUFFLFFBQVEsTUFBTSxRQUFRLGdCQUFnQjtBQUFBLFlBQ3JELFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVk7QUFBQSxnQkFDVixZQUFZO0FBQUEsZ0JBQ1osZUFBZSxLQUFLLEtBQUssS0FBSztBQUFBLGNBQ2hDO0FBQUEsWUFDRjtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDL0I7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSCxxQkFBcUI7QUFBQSxNQUNuQixNQUFNO0FBQUEsUUFDSixnQkFBZ0I7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBLE1BS2xCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLEtBQUs7QUFBQSxJQUNMLE1BQU07QUFBQSxJQUtOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxVQUFVO0FBQUEsRUFDVixRQUFRO0FBQUEsSUFDTixpQkFBaUIsS0FBSyxVQUFVLGdCQUFJLE9BQU87QUFBQSxFQUM3QztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
