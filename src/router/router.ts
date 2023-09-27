import { createRouter, createWebHistory } from "vue-router";
import store from "@/store/store";
// import LS from "@/services/localStorage";

// components
import Login from '@/modules/Login/Login.vue'
import Home from '@/modules/Home/Home.vue'
import LS from "@/services/localStorage";
import toast from "@/services/toast";

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

router.beforeEach(async(to, from, next) => {

  //* on va chercher les infos de l'user dans le LS
  const userLS = LS.get('TOOLS_CORE')

  if (to.fullPath === '/login' && store.getters['Core/isLogged']) {
    next('/')
    return
  }
  else if (to.meta.requireAuth && !store.state.Core.user.isLogged) {
    if (userLS && typeof userLS.user === 'object') {
      try {
        const result = await store.dispatch('Core/getInfosUser')
        if (result.status == 1) {
          store.dispatch('Core/insertUser', userLS.user)
          next()
        }
      } catch (err: any) {
        // toast.error(`Erreur lors de la tentative de reconnection`)
        toast.error(err.message)
      }
    }
    next('/login')
    return
  } else {
    next()
    return
  }
})

export default router