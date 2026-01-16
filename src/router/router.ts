import { createRouter, createWebHistory } from "vue-router";

// components
import Home from '@/modules/Home/Home.vue'
const Auth = () => import('@/modules/Auth/Auth.vue')

import PrivacyPolicy from "@/modules/Legal/PrivacyPolicy.vue";
import TermsOfService from "@/modules/Legal/TermsOfService.vue";

import NotFound from '@/modules/Common/NotFound.vue';
import { useAuthStore } from "@/stores/auth.store";
import { useFetchMe } from "@/modules/Auth/hooks/useFetchMe";
import { clientInit } from "@/services/axiosInstance";

import type { RouteLocationNormalizedLoaded } from 'vue-router'

export const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
    meta: { requireAuth: true }
  },
  {
    name: 'verify-email',
    path: '/auth/verify-email',
    component: () => import('@/modules/Auth/VerifyEmail.vue'),
    meta: { requireAuth: false }
  },
  {
    name: 'password-reset-request',
    path: '/forgot-password',
    component: () => import('@/modules/Auth/PasswordResetRequest.vue'),
    meta: { requireAuth: false }
  },
  {
    name: 'password-reset',
    path: '/auth/reset-password',
    component: () => import('@/modules/Auth/PasswordReset.vue'),
    meta: { requireAuth: false },
    props: (route: RouteLocationNormalizedLoaded) => ({
      token: route.query.token
    })
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
  const isLogin = to.path === '/login'

  //* Initialisation auth (UNE SEULE FOIS)
  if (!auth.authInitialized) {
    try {
      const { data } = await clientInit.post('/auth/refresh')
      auth.setToken(data.accessToken)

      const me = await useFetchMe()
      auth.setUser(me.data)
    } catch {
      auth.logout()
    } finally {
      auth.setAuthInitialized()
    }
  }

  //* Route protégée sans utilisateur
  if (requireAuth && !auth.user) {
    return '/login'
  }

  //* Déjà connecté → pas d’accès à /login
  if (auth.user && isLogin) {
    return '/'
  }

  return true
})

export default router