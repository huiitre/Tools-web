import { createApp } from 'vue'
// import '@/assets/styles/font-awesome5.15.4.css'
import './assets/styles/main.scss'
import App from './App.vue'
import store from '@/store/store'
import router from '@/router/router'

const app = createApp(App)
app.use(store)
app.use(router)
app.mount("#app");
