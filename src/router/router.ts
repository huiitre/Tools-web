import { createRouter, createWebHistory } from "vue-router";
import store from "@/store/store";
// import LS from "@/services/localStorage";

// components
import Login from '@/modules/Login/Login.vue'
import Home from '@/modules/Home/Home.vue'
import LS from "@/services/localStorage";
import toast from "@/services/toast";
import Dofus from "@/modules/Dofus/Dofus.vue";
import DofusItem from "@/modules/Dofus/DofusItem.vue";

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
  },
  {
    name: 'dofus',
    path: '/dofus',
    component: DofusItem,
    meta: { requireAuth: true },
    children: [
      {
        name: 'item',
        path: 'item',
        component: DofusItem,
        meta: { requireAuth: true }
      }
    ]
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
  const userLS = LS.get('TOOLS_CORE_USER')

  let isLogged = store.getters['Core/isLogged'];
  const isPublicRoute = !to.meta.requireAuth;
  const userInStorage = typeof userLS?.user === 'object';

  console.log(`%c Route Demandée: ${to.fullPath}`, 'background:blue;color:white;font-weight:bold;');

  if (isLogged && to.fullPath !== '/login') {
    return next()
  }

  //* si on a un objet en LS et qu'on est pas déjà connecté, on va essayer de se connecter
  if (userInStorage && !isLogged) {
    const result = await store.dispatch('Core/getInfosUser');
    if (result?.status) {
      store.dispatch('Core/insertUser', result.data)
      isLogged = true
    } else {
      store.dispatch('Core/clearUser')
      isLogged = false
    }
  }

  //* route sécurisé et connecté
  if (!isPublicRoute && isLogged) {
    console.log("%c router.ts #78 || store.getters['Core/isLogged'] : ", 'background:red;color:#fff;font-weight:bold;', store.getters['Core/isLogged']);
    next()
  }
  else {
    //* connecté mais /login
    if (isLogged && to.fullPath === '/login') {
      next('/')
    }
    //* pas connecté et route sécurisé
    else if (!isPublicRoute && !isLogged) {
      next('/login')
    } else {
      next()
    }
  }
})

export default router