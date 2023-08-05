import { createRouter, createWebHistory } from "vue-router";
import store from "@/store/store";
// import LS from "@/services/localStorage";

// components
import Login from '@/modules/Login/Login.vue'
import Home from '@/modules/Home/Home.vue'

export const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
    meta: { requireAuth: true }
  },
  {
    name: 'connexion',
    path: '/login',
    component: Login,
    meta: { requireAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(
    import.meta.env.BASE_URL
  ),
  routes
})

router.beforeEach((to, from, next) => {
  console.log("%c router.ts #33 || from : ", 'background:red;color:#fff;font-weight:bold;', from);
  console.log("%c router.ts #32 || store : ", 'background:red;color:#fff;font-weight:bold;', store.state);
  if (to.meta.requireAuth && !store.state.Core.user.isLogged)
    next('/login')
  next()
})

export default router