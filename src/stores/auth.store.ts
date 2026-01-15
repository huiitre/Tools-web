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

type Module = {
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
  roles: Role[]
  modules: Module[]
}

type AuthState = {
  user: User | null
  accessToken: string | null
}

/* ======================
   STORE
====================== */

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null
  }),

  getters: {
    isAuthenticated: (s) => !!s.user
  },

  actions: {

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
