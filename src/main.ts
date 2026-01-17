import { createApp } from 'vue'
import './assets/styles/main.scss'
import App from './App.vue'
import router from '@/router/router'

import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'

// PWA auto-update
import { registerSW } from 'virtual:pwa-register'

import { getTheme, initThemeListener, setTheme } from '@/ui/theme'

setTheme(getTheme())
initThemeListener()

// --- PWA auto update ---
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true)
  },
  onOfflineReady() {
    console.log('PWA prête pour utilisation hors-ligne 🚀')
  }
})

// --- Création de l’app ---
const app = createApp(App);

const pinia = createPinia()
app.use(pinia)

app.use(router)
app.mount('#app')
