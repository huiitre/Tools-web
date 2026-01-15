import axios, { AxiosInstance } from 'axios'
import router from '@/router/router'
import toast from './toast'
import { useAuthStore } from '@/stores/auth.store'

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
    const token = auth.accessToken

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  })

  /* ---------- RESPONSE ---------- */
  let isRefreshing = false
  let queue: {
    resolve: (value?: unknown) => void
    reject: (err: any) => void
  }[] = []

  const flushQueue = (error?: any) => {
    queue.forEach(p => {
      if (error) p.reject(error)
      else p.resolve()
    })
    queue = []
  }

  client.interceptors.response.use(
    response => response,
    async error => {
      const status = error?.response?.status
      const originalRequest = error.config
      const auth = useAuthStore()

      if (status !== 401 || originalRequest._retry) {
        return Promise.reject(error)
      }

      //* on ne refresh jamais sur login / refresh
      if (
        originalRequest.url.includes('/auth/login') ||
        originalRequest.url.includes('/auth/refresh')
      ) {
        auth.logout()
        router.push('/login')
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject })
        }).then(() => client(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await client.post('/auth/refresh')

        const { accessToken } = data
        auth.setToken(accessToken)

        flushQueue()
        return client(originalRequest)

      } catch (refreshError) {
        flushQueue(refreshError)
        auth.logout()
        router.push('/login')
        return Promise.reject(refreshError)

      } finally {
        isRefreshing = false
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

export { clientV1, clientV2, clientV3 }
