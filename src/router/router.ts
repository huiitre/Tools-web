import { createRouter, createWebHistory } from "vue-router";

// components
import Home from '@/modules/Home/Home.vue'
const Auth = () => import('@/modules/Auth/Auth.vue')

import PrivacyPolicy from "@/modules/Legal/PrivacyPolicy.vue";
import TermsOfService from "@/modules/Legal/TermsOfService.vue";

import NotFound from '@/modules/Common/NotFound.vue';
import { useAuthStore } from "@/stores/auth.store";
import { useFetchMe } from "@/modules/Auth/hooks/useFetchMe";

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
    component: Auth,
    meta: { requireAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { requireAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(
    import.meta.env.BASE_URL
  ),
  routes
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const requireAuth = to.meta.requireAuth === true

  if (requireAuth && !auth.user) {
    try {
      const { data } = await useFetchMe()
      auth.setUser(data)
    } catch {
      auth.logout()
      return '/login'
    }
  }

  if (auth.user && to.path === '/login') {
    return '/'
  }

  return true
})

export default router