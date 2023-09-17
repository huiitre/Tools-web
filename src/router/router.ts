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
  // const user = LS.get('TOOLS_USER')
  console.log("%c router.ts #33 || from : ", 'background:red;color:#fff;font-weight:bold;', from);
  if (to.fullPath === '/login' && store.getters['Core/isLogged']) {
    console.log("%c router.ts #36 || next home", 'background:blue;color:#fff;font-weight:bold;');
    next('/')
  }
  else if (to.meta.requireAuth && !store.state.Core.user.isLogged) {
    console.log("%c router.ts #34 || next login", 'background:blue;color:#fff;font-weight:bold;');
    next('/login')
  }
  console.log("%c router.ts #37 || next classique", 'background:blue;color:#fff;font-weight:bold;');
  console.log("%c router.ts #38 || to : ", 'background:red;color:#fff;font-weight:bold;', to);
  next()
})

export default router