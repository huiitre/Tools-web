import axios, { AxiosInstance } from 'axios'
import { useAuthStore } from '@/stores/auth.store'
import { ApiException } from './ApiException'

/* ======================
   CLIENT FACTORY
====================== */

const createClient = (version: string): AxiosInstance =>
  axios.create({
    baseURL: `${import.meta.env.VITE_TOOLS_API_BASE_URL}/api/${version}`,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  })

const clientInit = axios.create({
  baseURL: `${import.meta.env.VITE_TOOLS_API_BASE_URL}/api/v3`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

const clientV1 = createClient('v1')
const clientV2 = createClient('v2')
const clientV3 = createClient('v3')

/* ======================
   INTERCEPTORS
====================== */

const attachInterceptors = (client: AxiosInstance) => {

  /* ---------- REQUEST ---------- */
  client.interceptors.request.use((config) => {
    const auth = useAuthStore()

    if (auth.accessToken) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${auth.accessToken}`
    }

    return config
  })

  /* ---------- RESPONSE ---------- */
  client.interceptors.response.use(
    response => response,
    async error => {
      const auth = useAuthStore()
      const status = error?.response?.status
      const originalRequest = error.config

      /* -----------------------------
         PAS UNE 401 → ON REMONTE
      ----------------------------- */
      if (status !== 401) {
        const responseData = error.response?.data

        if (responseData?.message) {
          return Promise.reject(
            new ApiException(
              responseData.message,
              status,
              responseData.code
            )
          )
        }

        return Promise.reject(error)
      }

      /* -----------------------------
         401 SUR /auth/login
      ----------------------------- */
      if (originalRequest.url.includes('/auth/login')) {
        const responseData = error.response?.data

        return Promise.reject(
          new ApiException(
            responseData?.message ?? 'Identifiants invalides',
            status,
            responseData?.code
          )
        )
      }

      /* -----------------------------
         401 SUR /auth/refresh
         → SESSION MORTE
      ----------------------------- */
      const wasAuthenticated = !!auth.user
      if (originalRequest.url.includes('/auth/refresh')) {
        auth.logout()

        if (wasAuthenticated) {
          window.dispatchEvent(new Event('auth:expired'))
        }

        return new Promise(() => {})
      }

      /* -----------------------------
         SÉCURITÉ : PAS DE BOUCLE
      ----------------------------- */
      if (originalRequest._retry) {
        auth.logout()
        window.dispatchEvent(new Event('auth:expired'))
        return new Promise(() => {})
      }

      /* -----------------------------
         TENTATIVE DE REFRESH
      ----------------------------- */
      originalRequest._retry = true

      try {
        const { data } = await client.post('/auth/refresh')
        auth.setToken(data.accessToken)
        return client(originalRequest)

      } catch (refreshError) {
        auth.logout()
        window.dispatchEvent(new Event('auth:expired'))
        return new Promise(() => {})
      }
    }
  )
}

/* ======================
   INIT
====================== */

attachInterceptors(clientV1)
attachInterceptors(clientV2)
attachInterceptors(clientV3)

export { clientV1, clientV2, clientV3, clientInit }
