import { createRouter, createWebHistory } from "vue-router";
import store from "@/store/store";
// import LS from "@/services/localStorage";

// components
import Home from '@/modules/Home/Home.vue'
import LS from "@/services/localStorage";
import DofusItem from "@/modules/Dofus/DofusItem/DofusItem.vue";
import Login from '@/modules/Login/Login.vue'

import PrivacyPolicy from "@/modules/Legal/PrivacyPolicy.vue";
import TermsOfService from "@/modules/Legal/TermsOfService.vue";
import DofusSet from "@/modules/Dofus/DofusSet/DofusSet.vue";
import Dofus from "@/modules/Dofus/Dofus.vue";
import NotFound from "@/modules/Common/NotFound.vue";

export const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
    meta: { requireAuth: true }
  },
  {
    name: 'settings',
    path: '/settings',
    component: Home,
    meta: { requireAuth: true }
  },
  {
    name: 'PrivacyPolicy',
    path: '/privacy-policy',
    component: PrivacyPolicy,
    meta: { requireAuth: false }
  },
  {
    name: 'TermsOfService',
    path: '/terms-of-service',
    component: TermsOfService,
    meta: { requireAuth: false }
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
    component: Dofus,
    meta: { requireAuth: true, idmodule: 1 },
    redirect: { name: 'dofus-item' },
    children: [
      {
        name: 'dofus-item',
        path: 'item',
        component: DofusItem,
        meta: { requireAuth: true, label: 'Recherche Item' }
      },
      {
        name: 'dofus-set',
        path: 'set/:setCode?',
        component: DofusSet,
        meta: { requireAuth: true, label: 'Gestion Set' }
      },
      {
        name: 'dofus-set-shared',
        path: 'set/shared/:token',
        component: DofusSet,
        props: { readonly: true },
        meta: { requireAuth: false, label: 'Set Partagé' },
      },
    ]
  },
  {
    path: '/:catchAll(.*)*', // Catch-all pour toutes les URL non correspondantes
    name: 'NotFound',
    component: NotFound,
    meta: { requireAuth: false },
  },
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

  if (isLogged && to.fullPath !== '/login') {
    return next()
  }

  //* si on a un objet en LS et qu'on est pas déjà connecté, on va essayer de se connecter
  if (userInStorage && !isLogged) {
    try {
      store.commit('Core/isLoading', true)
      const result = await store.dispatch('Core/getInfosUser');

      if (!result?.status)
        throw result?.msg

      //* récupération des modules
      const { data } = await store.dispatch('Core/getUserModules')
      store.commit('Core/setUserModules', data)

      await store.dispatch('Core/insertUser', result.data)

      isLogged = true
      store.commit('Core/isLoading', false)

    } catch(err) {
      console.log("%c router.ts #94 || err : ", 'background:red;color:#fff;font-weight:bold;', err);
      store.dispatch('Core/clearUser')
      isLogged = false
      store.commit('Core/isLoading', false)
      return next('/login')
    }
  }

  //* route sécurisé et connecté
  if (!isPublicRoute && isLogged) {
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