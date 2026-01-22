import { defineStore } from 'pinia'

/* ======================
   TYPES MÉTIER
====================== */

type Role = {
  id: string
  code: string
  name: string
  description: string
  active: boolean
}

export type ModuleType = {
  id: string
  code: string
  name: string
  description: string
  active: boolean
  roles: Role[]
}

type User = {
  id: string
  email: string
  name: string
  userType: string
  active: boolean
  avatarUrl: string
  roles: Role[]
  modules: ModuleType[]
}

type AuthState = {
  user: User | null
  accessToken: string | null
  authInitialized: boolean
}

/* ======================
   STORE
====================== */

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    authInitialized: false
  }),

  getters: {
    isAuthenticated: (s) => !!s.user
  },

  actions: {

    setAuthInitialized() {
      this.authInitialized = true
    },

    setToken(token: string) {
      this.accessToken = token
    },

    setUser(user: User) {
      this.user = user
    },

    logout() {
      this.user = null
      this.accessToken = null
    }
  }
})
