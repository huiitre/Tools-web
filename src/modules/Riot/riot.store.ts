import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'riot.auth'

export type RiotRegion = 'eu' | 'na' | 'ap' | 'kr' | 'br' | 'latam'

interface RiotAuth {
  accessToken: string
  region: RiotRegion
}

export const useRiotStore = defineStore('riot', () => {
  const stored = (() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      return JSON.parse(raw) as RiotAuth
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  })()

  const accessToken = ref<string | null>(stored?.accessToken ?? null)
  const region = ref<RiotRegion>(stored?.region ?? 'eu')

  function setAuth(token: string, reg: RiotRegion) {
    accessToken.value = token
    region.value = reg
    persist()
  }

  function setRegion(reg: RiotRegion) {
    region.value = reg
    persist()
  }

  function clearAuth() {
    accessToken.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  function persist() {
    const data: RiotAuth = {
      accessToken: accessToken.value!,
      region: region.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }

  return { accessToken, region, setAuth, setRegion, clearAuth }
})
