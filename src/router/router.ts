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
import Todolist from "@/modules/Todolist/Todolist.vue";
import DofusMinogolem from "@/modules/Dofus/DofusMinogolem/DofusMinogolem.vue";
import EventGalet from "@/modules/Dofus/EventGalet/EventGalet.vue";
import SavingAllocation from "@/modules/SavingAllocation/SavingAllocation.vue";

import Weight from "@/modules/Health/Weight/Weight.vue";
import WeightAdd from "@/modules/Health/Weight/WeightAdd.vue";
import WeightHistory from "@/modules/Health/Weight/WeightHistory.vue";
import WeightCalendar from "@/modules/Health/Weight/WeightCalendar.vue";
import WeightChart from "@/modules/Health/Weight/WeightChart.vue";
import DofusConfig from "@/modules/Dofus/DofusConfig/DofusConfig.vue";
import TodolistList from "@/modules/Todolist/TodolistList.vue";
import TodoListTodo from "@/modules/Todolist/TodolistTodo.vue";
import DofusMinotororLab from "@/modules/Dofus/DofusMinotororLab/DofusMinotororLab.vue";
import DofusAlmanax from "@/modules/Dofus/DofusAlmanax/DofusAlmanax.vue";

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
    redirect: { name: 'dofus-almanax' },
    children: [
      {
        name: 'dofus-almanax',
        path: 'almanax',
        component: DofusAlmanax,
        meta: { requireAuth: true, label: 'Almanax' }
      },
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
        name: 'dofus-une-ame-en-peine',
        path: 'une-ame-en-peine',
        component: DofusMinogolem,
        meta: { requireAuth: true, label: 'Une âme en peine' }
      },
      /* {
        name: 'dofus-event-galet',
        path: 'event-galet',
        component: EventGalet,
        meta: { requireAuth: true, label: 'Event galet' }
      }, */
      {
        name: 'dofus-set-shared',
        path: 'set/shared/:token',
        component: DofusSet,
        props: { readonly: true },
        meta: { requireAuth: true, label: 'Set Partagé' },
      },
      {
        name: 'dofus-config',
        path: 'configuration',
        component: DofusConfig,
        meta: { requireAuth: true, label: 'Configuration' },
      },
      /* {
        name: 'dofus-minotororlab',
        path: 'minotororlab',
        component: DofusMinotororLab,
        meta: { requireAuth: true, label: 'Labyrinthe du Minotoror' },
      }, */
    ]
  },
  {
    name: 'repartition-d\'epargne',
    path: '/repartition-epargne',
    component: SavingAllocation,
    meta: { requireAuth: true, idmodule: 4 }
  },
  {
    name: 'healthy',
    path: '/health/weight',
    component: Weight, // composant parent (layout)
    meta: { requireAuth: true },
    redirect: { name: 'healthy-weight-add' },
    children: [
      {
        name: 'healthy-weight-add',
        path: 'add',
        component: WeightAdd,
        meta: { requireAuth: true, label: 'Ajouter' }
      },
      {
        name: 'health-weight-history',
        path: 'history',
        component: WeightHistory,
        meta: { requireAuth: true, label: 'Historique' }
      },
      {
        name: 'health-weight-calendar',
        path: 'calendar',
        component: WeightCalendar,
        meta: { requireAuth: true, label: 'Calendrier' }
      },
      {
        name: 'health-weight-chart',
        path: 'chart',
        component: WeightChart,
        meta: { requireAuth: true, label: 'Graphique' }
      }
    ]
  },
  {
    name: 'todolist',
    path: '/todolist',
    component: Todolist,
    redirect: { name: 'todolist-active' },
    meta: { requireAuth: true, idmodule: 3 },
    children: [
      {
        name: 'todolist-active',
        path: 'active',
        component: TodolistList,
        meta: { requireAuth: true, label: 'Actifs' }
      },
      {
        name: 'todolist-archived',
        path: 'archived',
        component: TodolistList,
        meta: { requireAuth: true, label: 'Archivés' }
      },
      {
        name: 'todolist-element',
        path: ':idtodolist',
        component: TodoListTodo,
        meta: { requireAuth: true },
        beforeEnter: (to: any, from: any, next: any) => {
          // Si on arrive directement depuis un refresh -> redirige vers /active
          if (!from.name) {
            next({ name: 'todolist-active' })
          } else {
            next()
          }
        }
      }
    ]
  },
  /* {
    path: '/:catchAll(.*)*', // Catch-all pour toutes les URL non correspondantes
    name: 'NotFound',
    component: NotFound,
    meta: { requireAuth: false },
  }, */
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

      if (result?.status === 0)
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