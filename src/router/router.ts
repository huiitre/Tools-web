import { createRouter, createWebHistory } from "vue-router";
import store from "@/store/store";
// import LS from "@/services/localStorage";

console.log("%c router.ts #5 || import.meta.env : ", 'background:red;color:#fff;font-weight:bold;', import.meta.env);

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
  if (to.meta.requireAuth && !store.state.Core.user.isLogged)
    next('/login')
  next()
})

export default router