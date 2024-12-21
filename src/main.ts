import { createApp } from 'vue'
// import '@/assets/styles/font-awesome5.15.4.css'
import './assets/styles/main.scss'
import App from './App.vue'
import store from '@/store/store'
import router from '@/router/router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          background: '#FFFFFF',
        },
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#757575',
          background: '#121212',
        },
      },
    },
  },
})

const app = createApp(App)
app.use(store)
app.use(router)
app.use(vuetify)
app.mount("#app");
